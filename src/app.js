// >> 3-party-modules
const express = require('express');

const viewsRouter = require('./modules/v1/view/view.routes');
const bootstrapMiddlewares = require('./middlewares');
const bootstrapRoutes = require('./modules/v1');

const app = express();

bootstrapMiddlewares(app); // - Middlewares registration

app.use('/', viewsRouter);

bootstrapRoutes(app); // - Routes registration

module.exports = app;
