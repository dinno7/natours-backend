const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// >> Utils:
hashToken = function(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};
exports.hashToken = hashToken;

uuidv4 = function() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};
exports.uuidv4 = uuidv4;

// >> Mongodb middlewares:
exports.preSave_convertUserPasswordToHash = async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
};

exports.preSave_setPasswordUpdatedAt = function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordUpdatedAt = Date.now() - 1000;
  next();
};

// >> Schema Methods & Statics functions:
exports.getUserByResetPasswordToken = async function(token) {
  const resetTokenHash = hashToken(token);

  const user = await this.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() }
  });

  return user;
};

exports.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = hashToken(resetToken);
  this.passwordResetExpires = Date.now() + 1000 * 60 * 10;

  return resetToken;
};

exports.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordUpdatedAt) {
    const passwordUpdatedAtTimestamp = parseInt(
      this.passwordUpdatedAt.getTime() / 1000
    );

    return passwordUpdatedAtTimestamp > JWTTimeStamp;
  }

  return false;
};

exports.isPasswordCorrect = async function(userPassword, hashedPassword) {
  return await bcrypt.compare(userPassword, hashedPassword);
};
