const { Router } = require('express');

const router = Router();
const userController = require('./user.controllers');
const authController = require('../global/auth.controller');
const { catchError } = require('../../../utils');

router.post('/signup', catchError(authController.singUp));
router.post('/login', catchError(authController.login));

// >> / ==> /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.param('id', userController.checkUserId);
router.route('/:id').get(userController.getUserById);

module.exports = router;
