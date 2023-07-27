const { Router } = require('express');

const router = Router();
const userController = require('./user.controllers');

// >> / ==> /api/v1/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.param('id', userController.checkUserId);
router.route('/:id').get(userController.getUserById);

module.exports = router;
