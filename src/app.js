// >> 3-party-modules
const express = require('express');

const registerMiddlewares = require('./middlewares');
const registerRoutes = require('./modules/v1');

const app = express();

registerMiddlewares(app); // - Middlewares registration
registerRoutes(app); // - Routes registration

module.exports = app;
