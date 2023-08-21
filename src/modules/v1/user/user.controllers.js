const User = require('./user.model');
const { sendSuccessResponse } = require('../../../utils/global');
const { factory } = require('../../../utils');
const { setUserIdInParams } = require('./user.utils');

const usersFilePath = `${__dirname}/../../../static/data/users.json`;

exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  let newUser = req.body;
  return sendSuccessResponse(res, {}, 1);
};

exports.getUserById = factory.getOneById(User);
exports.getMe = [setUserIdInParams, this.getUserById];
