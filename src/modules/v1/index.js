// !! ATTENTION:
// >> Don not change this file, just add routes to /src/modules/v*/routes.js
// - Your declared routes in ./routes.js, added here automatically.

const allRoutes = require('./routes');
function registerRoutes(app) {
  try {
    const apiVersion = __dirname.split('/').at(-1);
    for (let route in allRoutes) {
      app.use(`/api/${apiVersion}/${route}`, allRoutes[route]);
    }

    return true;
  } catch (err) {
    console.log(
      '⭕️ ~ ERROR  ~ in natours: src/modules/v1/index.js at line 7 ~> ❗',
      err
    );
    return err;
  }
}

module.exports = registerRoutes;
