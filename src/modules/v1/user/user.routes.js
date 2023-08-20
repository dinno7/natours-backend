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
// router.get(
//   '/getMe',
//   authController.protect,
//   userController.getMe,
//   userController.getUserById
// );

router.route('/getMe').get(authController.protect, userController.getMe);

// >> / ==> /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUserById);

module.exports = router;
