const { Router } = require('express');
const viewController = require('./view.controller');
const authController = require('../global/auth.controller');

const router = Router();

router.get('/me', authController.protect, viewController.account);

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.login);
router.get('/signup', viewController.signup);

module.exports = router;
