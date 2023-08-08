const { Router } = require('express');

const router = Router();
const userController = require('./user.controllers');
const authController = require('../global/auth.controller');

router.post('/signup', authController.singUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);
router.patch('/updateMe', authController.protect, authController.updateMe);

router.delete('/deleteMe', authController.protect, authController.deleteMe);

// >> / ==> /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.param('id', userController.checkUserId);
router.route('/:id').get(userController.getUserById);

module.exports = router;
