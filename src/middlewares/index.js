const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

function registerMiddlewares(app) {
  try {
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        parameterLimit: 100000,
        limit: '1mb'
      })
    );
    app.use(express.static(`${__dirname}/../public`));

    return true;
  } catch (err) {
    console.error(
      '⭕️ ~ ERROR  ~ in natours: src/middlewares/index.js at line 11 ~> ❗️',
      err
    );
    return err;
  }
}

module.exports = registerMiddlewares;
