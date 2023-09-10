const multer = require('multer');
const sharp = require('sharp');

const User = require('./user.model');
const { sendSuccessResponse, filterObj } = require('../../../utils/global');
const { factory, AppError, catchError } = require('../../../utils');
const { setUserIdInParams, createSendJWTToken } = require('./user.utils');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-345235sad32523asd523sda5454-123432.jpg
//     const fileExt = file.mimetype.split('/').at(-1);
//     const fileName = `user-${req.user.id}-${Date.now()}.${fileExt}`;

//     cb(null, fileName);
//   }
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('Please provide valid image', 400), false);

  return cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadMyPhoto = upload.single('photo');

exports.resizeAvatarPhoto = catchError(async (req, res, next) => {
  if (!req.file) return next();
  //1MB
  if (req.file.size >= 1_048_576) {
    req.file = undefined;
    return next(new AppError('Avatar image must be less than 1MB', 400));
  }

  req.file.filename = `user-${res.locals.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(512, 512)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  const newUser = req.body;
  return sendSuccessResponse(res, { newUser }, 1);
};

exports.getUserById = factory.getOneById(User);
exports.getMe = [setUserIdInParams, this.getUserById];

exports.updateMe = catchError(async function (req, res, next) {
  const { password, passwordConfirm } = req.body;
  // 1) Create error if user POSTs password data
  if (password || passwordConfirm)
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400,
      ),
    );

  // 2) Filter out unwanted fields
  const filteredFields = filterObj(req.body, 'name', 'email');
  if (req.file) filteredFields.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    res.locals.user._id,
    filteredFields,
    {
      new: true,
      runValidators: true,
    },
  ).select('-password -passwordResetToken -passwordResetExpires');

  return sendSuccessResponse(res, { user: updatedUser }, 1);
});

exports.updateMyPassword = catchError(async function (req, res, next) {
  if (!res.locals?.user?._id)
    return next(new AppError('Please login first', 401));

  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm)
    return next(
      new AppError(
        'Please provide your current password and new password and confirm of new password',
        400,
      ),
    );

  if (currentPassword === newPassword)
    return next(
      new AppError(
        'Your new password is your current password, please choose another one',
        400,
      ),
    );

  const user = await User.findById(res.locals.user._id).select('+password');
  if (
    !(await user.isPasswordCorrect(currentPassword, res.locals.user.password))
  )
    return next(new AppError('Your current password is wrong', 401));

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  createSendJWTToken(res, user, 200);
});

exports.deleteMe = catchError(async function (req, res, next) {
  await User.findByIdAndUpdate(res.locals.user._id, {
    active: false,
  });

  return sendSuccessResponse(res, null);
});
