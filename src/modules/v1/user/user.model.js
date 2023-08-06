const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The user name is required']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'The email of user is required'],
    lowercase: true,
    validate: {
      validator: function(VAL) {
        const emailPattern = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
        return emailPattern.test(VAL);
      },
      message: 'Email is invalid, provide a valid Email'
    }
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Provide a Password'],
    minlength: [8, 'The min length for Password is 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Provide a Confirm password'],
    minLength: [8, 'The min length for Confirm password is 8 characters'],
    validate: {
      validator: function(VAL) {
        return VAL === this.password;
      },
      message: 'Password and Confirm password must be same value'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.isPasswordCorrect = async function(
  userPassword,
  hashedPassword
) {
  return await bcrypt.compare(userPassword, hashedPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
