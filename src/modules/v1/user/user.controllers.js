const fs = require('fs');
const User = require('./user.model');
const { sendSuccessResponse } = require('../../../utils/global');
const { factory } = require('../../../utils');

const usersFilePath = `${__dirname}/../../../static/data/users.json`;
const users = JSON.parse(fs.readFileSync(usersFilePath));

exports.getAllUsers = async function(req, res) {
  const users = await User.find();

  return sendSuccessResponse(res, { users }, users.length);
};

exports.createUser = (req, res) => {
  let newUser = req.body;
  return sendSuccessResponse(res, {}, 1);
};

exports.getUserById = factory.getOneById(User);

exports.getMe = [setUserIdInParams, this.getUserById];

async function setUserIdInParams(req, res, next) {
  req.params.id = req.user._id;
  next();
}
