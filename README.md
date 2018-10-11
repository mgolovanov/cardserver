# Casino: the Card Deck management project 

Usage Instructions
* Toggle Reveal cards to show the cards. That would also enable dragging / copying between the two decks.
* When the cards are face-up / revealed, you can drag-n-drop or copy-paste one or many cards bewteen the Table (top) and the Drawer (bottom). You can copy-paste the card glyphs using clipboard.
* Each card is encoded with an alphabet letter in range of [A..Z, a..z]. Guess the letter code for the ?? Ace of Spades! ?
* Type alphabet letters in Table Deck ID field to customize your deck.
* Click on a card to select ??, then Cut to push all cards before this card to the back of the deck
* Click Shuffle to invoke the server crypto-random API to shuffle the top 'Desk' deck (bottom 'Drawer remains intact).
* Click Pop to move the card from the top desk to the bottom drawer and reveal the card.

All UI buttons invoke the card server API to operate the current user's deck. You can click on Swagger and Tests buttons above to see how this app is built.
