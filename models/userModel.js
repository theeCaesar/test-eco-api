const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const usersSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'insert the user email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'email is not valid'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'insert the user password'],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
    id: false,
  },
);

usersSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000 * 60 * 5;
  next();
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.methods.checkPassword = async function (
  inputPassword,
  userPassword,
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

usersSchema.methods.checkChangedPassword = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const holder = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < holder;
  }

  return false;
};

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;
