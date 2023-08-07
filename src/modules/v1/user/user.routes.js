const { Router } = require('express');

const router = Router();
const userController = require('./user.controllers');
const authController = require('../global/auth.controller');

router.post('/signup', authController.singUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// >> / ==> /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.param('id', userController.checkUserId);
router.route('/:id').get(userController.getUserById);

module.exports = router;
