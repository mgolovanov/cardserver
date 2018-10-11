// Top and bottom Layout IDs, cut position (where mouse cursor is) and if the top deck is visible
var table_deck_id = "";    // Hashcode of table deck: table - cards that were already dealt (drawer)
var drawer_deck_id = "";    // Hashcode of drawer
var cut_position = 0;     // Position to cut the deck at
var table_deck_visible = false; // Whether to show the deck cards or not

// Mapping between glyphs and their serializeable codes
var glyphs;                     // Last server response with a glyph collection
var codes;                      // Last server response with a table hashcode (==table_deck_id)
var g2c;                        // Map glyphs to codes
var c2g;                        // Map codes to glyphs
var CARD_BACK = "🂠";

/**
 * Hide/show cards in the top section
 */
function onDeckVisibilityChanged() {
    table_deck_visible = $("#showCards").is(':checked');
    $('#table_deck').attr('contenteditable', table_deck_visible ? 'true' : 'false');
    $("#table_deck").html(renderDeckHTML(table_deck_id, table_deck_visible));
}

/**
 * Refresh the drawer layout based on information received from server
 */
function refreshDrawer() {
    drawer_deck_id = "";
    if (table_deck_id.indexOf('-') > -1) {
        var s = table_deck_id.split('-');
        drawer_deck_id = s[1];
    }
    $("#drawer_layout_id").val(drawer_deck_id);
    $("#drawer_deck").html(renderDeckHTML(drawer_deck_id, true));
}

/**
 * Callback gets invoked on deck editing or drag and drop.
 * 
 * @param {*} e Event details
 */
function onDeckChanged(e) {
    var id = "#" + e.target.id;

    // concat either titles or text buffer contents
    // to recognize the list of cards on deck
    var text = "";
    $(id).children().each(function () {
        try {
            text += $(this).attr("title") || "";
        } catch (ex) {
            // can't find the element or attrib
        }
    });
    var text2 = $(id).text();
    if (text2.length > text.length)
        text = text2;

    // convert glyphs to code
    text = g2c_convert(text);

    var popItemsHash = "";
    if (table_deck_id.indexOf('-') > -1) {
        var s = table_deck_id.split('-');
        table_deck_id = s[0];
        popItemsHash = s[1];
    }

    // Table - dealer
    if (id.includes("table")) {
        if (popItemsHash !== "")
            text += "-" + popItemsHash;
        $("#table_layout_id").val(text);
        table_deck_id = text;
    } else
        // Drawer player
        if (id.includes("drawer")) {
            drawer_deck_id = text;
            $("#drawer_layout_id").val(drawer_deck_id);
            table_deck_id += "-" + drawer_deck_id;
            $("#table_layout_id").val(table_deck_id);
            // TODO: [MG] - do we need to refresh the table as well?
            $("#drawer_deck").html(renderDeckHTML(drawer_deck_id, true));
        }
}

/**
 * Invoked on card drag and drop into drawer (reserved for future use)
 * @param {*} e Event 
 */
function onCardDraw(e) {
    console.log(e);
}

/**
 * Prepare initial views and wire the deck change handlers.
 */
function onLoadComplete() {
    $('#table_layout_id').val("");
    $('#drawer_layout_id').val("");

    // Wire the listeners
    $("#table_deck").on('blur change keyup paste cut input delete mouseup', function (e) { onDeckChanged(e); });
    $('#table_deck').on("mousedown", function (e) { return table_deck_visible; });

    $("#drawer_deck").on('blur change keyup paste cut input delete mouseup', function (e) { onDeckChanged(e); });
    $("#drawer_deck").on('drop', function (e) { onCardDraw(e); });

    // Allow the user to modify the deck layout by editing its hash code
    $('#table_layout_id').on('keydown paste input', function (e) {
        table_deck_id = $("#table_layout_id").val();
        $("#table_deck").html(renderDeckHTML(table_deck_id, table_deck_visible));
    });
    resetTable();
}

/**
 * Check if char code is in range
 * @param {*} N Symbol to check
 * @param {*} x min
 * @param {*} y max
 * @returns {boolean} true if char code is in given range
 */
function between(N, x, y) {
    N = N.charCodeAt(0);
    x = x.charCodeAt(0);
    y = y.charCodeAt(0);
    return ((x<=N)&&(N<=y));
}

/**
 * Refresh Glyph To Code cache
 * @param {*} data Server-provisioned data
 */
function g2c_update(data) {
    g2c = {};
    c2g = {};
    glyphs = Array.from(data.glyphs);
    codes = data.id;
    table_deck_id = codes;
    for (var i = 0; i < codes.length; i++) {
        var code = codes[i];
        if (code !== '-')
            g2c[glyphs[i]] = code;
    }
    $.each(g2c, function (k, v) {
        c2g[v] = k;
    });
}

/**
 * Convert UTF-8 text to card deck hashcode
 * @param {*} text UTF-8 glyphs text
 * @returns {string} Deck hashcode string
 */
function g2c_convert(text) {
    var glyphs = Array.from(text);
    var result = "";
    for (var i = 0; i < glyphs.length; i++) {
        var val = g2c[glyphs[i]];
        if (typeof val !== 'undefined')
            result += g2c[glyphs[i]];
    }
    return result;
}

/**
 * Convert deck hashcode to UTF-8 text
 * @param {string} text Deck hashcode string
 * @returns {string} UTF-8 glyphs text
 */
function c2g_convert(text) {
    var result = "";
    for (var i = 0; i < text.length; i++) {
        var code = text[i];

        // Anything coming after '-' is invisible (in the drawer)
        if (code === '-')
            break;

        var val = c2g[code];
        if (typeof val !== 'undefined')
            result += val;
    }
    return result;
}

function selectText(containerid) {
    var range;
    var el = document.getElementById(containerid);
    if (document.selection) { // IE
        range = document.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    } else if (window.getSelection) {
        range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
    cut_position = range.startOffset;
}

/**
 * Convert deck hashcode into set of divs that would display the card glyphs
 * @param {*} hashCode Deck hash code
 * @param {boolean} isFaceUp Whether to show the card faces or not
 * @returns {sring} HTML code to render the card deck
 */
function renderDeckHTML(hashCode, isFaceUp) {
    var result = "";
    var color = "";
    for (var i = 0; i < hashCode.length; i++) {
        var code = hashCode[i];
        if (code === '-')
            // don't show popped card on a table
            break;
        var g = c2g[code];
        var inner = g;
        // skip invalid codes
        if (typeof g !== 'undefined') {
            if (between(code, 'A', 'Z'))
                color = 'black';
            else if (between(code, 'a', 'z'))
                color = 'red';
        }
        if (!isFaceUp) {
            inner = CARD_BACK;
            color = 'blue';
        }
        var html = [
            "<div id='card_" + i + "' class='card grabbable' onclick='selectText(this.id)' title='" + g + "'>",
            "<font color='" + color + "'>",
            inner,
            "</font>",
            "</div>"
        ];
        result += html.join("");
    }
    return result;
}

/**
 * Invoke the server-side card dealer API and refresh the table deck contents.
 * 
 * @param {number} op   Operation 
 * @param {*} id        Card deck hashcode
 * @param {*} pos       Card position for cutting
 */
function refresh(op, id, pos) {
    op = op || 0;
    id = id || 0;
    pos = pos || 0;

    var url = "/dealer?op=" + op;
    if (id !== 0)
        url += "&id=" + id;
    if (pos !== 0)
        url += "&pos=" + pos;

    $.ajax({
        url: url
    }).done(function (data) {
        // server provides the mapping between glyphs and codes
        g2c_update(data);
        $("#table_layout_id").val(table_deck_id);
        $("#table_deck").html(renderDeckHTML(table_deck_id, table_deck_visible));
        // TODO: [MG] - data.pop is ignored here
        refreshDrawer();
    });
}

/**
 * Clear the drawer deck and move its contents to table.
 */
function moveToTable() {
    var text = $("#drawer_deck").text();
    text = g2c_convert(text);
    // Notify server about the table deck change
    refresh(0, text);
    $("#drawer_deck").html("");
    $("#drawer_layout_id").val("");
}

/**
 * Cut the deck at given position by moving everything
 * before that position to the end of the deck
 */
function cut() {
    console.log("cut", table_deck_id);
    refresh(1, table_deck_id, cut_position);
}

/**
 * Pop one card off the deck
 */
function pop() {
    console.log("pop", table_deck_id);
    refresh(3, table_deck_id);
}

/**
 * Shuffle the top table deck
 */
function shuffle() {
    console.log("shuffle", table_deck_id);
    refresh(2, table_deck_id, 0);
}

/**
 * Reload brand new random deck
 */
function resetTable() {
    $("#table_deck").html("");
    $("#table_layout_id").val("");
    refresh();
}

/**
 * Clear the drawer
 */
function clearDrawer() {
    $("#drawer_deck").html("");
    $("#drawer_layout_id").val("");
}

function nav(id, param1) {
    switch (id) {
        case "btn_swagger":
            window.location.replace("/docs/");
            break;
        case "btn_tests":
            window.location.replace("/coverage/lcov-report/index.html");
            break;
    }
}
