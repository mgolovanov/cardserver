/* jshint esversion: 6 */
/* jslint esversion: 6 */
'use strict';

import SwaggerExpress from 'swagger-express-mw';
import SwaggerUi from 'swagger-tools/middleware/swagger-ui';
import os from 'os';
import express from 'express';
import path from 'path';
import util from 'util';
import _ from 'lodash';

import { Card, CardDeck } from './Cards';

let app = express();
let hostname = ("http://" + os.hostname() + ":"); // "http://127.0.0.1:";
let port = process.env.PORT || 10010;

console.log(`Starting server ${hostname}${port} ...`);

// const __dirname = path.dirname(new URL(import.meta.url).pathname);
let config = { appRoot: "." };

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) { throw err; }

  // Add swagger-ui (This must be before swaggerExpress.register)
  let ui = SwaggerUi(swaggerExpress.runner.swagger);
  app.use(ui);

  // install middleware
  swaggerExpress.register(app);

  app.listen(port);

  app.use(express.static('www'));

  let someText = "boo!";
  app.get('/boo', (req, res) => res.send(someText));

  swaggerExpress.runner.swagger.paths['/dealer'];
});

const OP_GENERATE = 0;
const OP_CUT      = 1;
const OP_SHUFFLE  = 2;
const OP_POP      = 3;

function carddeck(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  let id  = req.swagger.params.id.value || 0;
  let op  = req.swagger.params.op.value || 0;
  let pos = req.swagger.params.pos.value || 0;

  console.log(id, op, pos);

  let result = {};
  let deck = new CardDeck(id);
  let popItems = [];

  switch (op) {
    case OP_GENERATE:
      break;
    case OP_CUT:
      deck.cutAt(pos);
      break;
    case OP_SHUFFLE:
      deck.shuffle();
      break;
    case OP_POP:
      if (pos<=1)
        pos = 1;
      popItems = deck.pop(pos);
      break;
    default:
      console.log(`Unsupported op=$[op}`);
      break;
  }
  result = { 'id': deck.hashCode, 'op': op, 'glyphs': deck.glyphs };
  // populate pop items only for the pop op
  if (popItems.length)
    result.pop = popItems;
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
}

_['carddeck'] = carddeck;
