const catchAsyncErrors = require('../utils/catchAsyncErrors');
const Users = require('../models/userModel');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

let cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24,
  ),
  httpOnly: true,
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = (role = 'user') => {
  return catchAsyncErrors(async (req, res, next) => {
    if (role === 'admin') {
      if (!req.body.adminPassword === process.env.ADMIN_PASSWORD)
        return next(
          new appError('yor are not allowd to make this action', 400),
        );
    }
    if (req.body.password !== req.body.passwordConform) {
      return next(new appError('passwords are not the same', 400));
    }

    const newUser = await Users.create({
      password: req.body.password,
      email: req.body.email,
      role,
    });

    const token = createToken(newUser._id);
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('JWT', token, cookieOptions);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  });
};

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new appError('please insert email and passowrd', 400));

  const user = await Users.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new appError('incorrect email or password', 400));

  const token = createToken(user._id);
  // if (process.env.NODE_ENV) cookieOptions.secure = true;
  res.cookie('JWT', token);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new appError('yor are not authorized', 401));

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  const stillExistingUser = await Users.findById(decodedToken.id).select(
    '+password',
  );

  if (!stillExistingUser)
    return next(new appError('this user does no longer exist', 401));

  if (await stillExistingUser.checkChangedPassword(decodedToken.iat))
    return next(new appError('token is no longer valid', 401));

  req.user = stillExistingUser;

  next();
});

exports.onlyPermission = (...roles) => {
  return catchAsyncErrors(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new appError('yor do not have permission', 403));
    next();
  });
};
