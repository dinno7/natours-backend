const { Router } = require('express');

const router = Router();
const userController = require('./user.controllers');
const authController = require('../global/auth.controller');

router.post('/signup', authController.singUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// >> Protect all route after this middleware
router.use(authController.protect);
router.patch('/updateMyPassword', userController.updateMyPassword);
router.patch(
  '/updateMe',
  userController.uploadMyPhoto,
  userController.resizeAvatarPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);
router.route('/getMe').get(userController.getMe);

// >> / ==> /api/v1/users
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.route('/:id').get(userController.getUserById);

module.exports = router;
