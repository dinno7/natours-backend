const tourRoutes = require('./tour/tour.routes');
const userRoutes = require('./user/user.routes');

const routes = {
	tours: tourRoutes,
	users: userRoutes,
	// - just add new route here...
};

module.exports = routes;
