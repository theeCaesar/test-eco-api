const Orders = require('../models/ordersModel');
const APIFeatures = require('../utils/APIFeatures');
const appError = require('../utils/appError');
const catchAsyncErrors = require('../utils/catchAsyncErrors');

exports.getOrders = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Orders.find(), req.query)
    .filter()
    .sort()
    .paginaaton()
    .selectFields();

  const Orders = await features.query;

  res.status(200).json({
    status: 'success',
    results: Orders.length,
    data: {
      Orders,
    },
  });
});

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  if (req.body) {
    newOrder = await Orders.create(req.body);
  } else {
    return next(new appError('please insert Order data', 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      Order: newOrder,
    },
  });
});

exports.getOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Orders.findById(req.params.orderId);
  if (!order) {
    return next(new appError('order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  if (req.body) {
    updatedOrder = await Orders.findOneAndUpdate(
      { _id: req.params.orderId, user: req.user._id },
      json,
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    return next(new appError('please insert order new data', 400));
  }
  if (!updatedOrder) {
    return next(new appError('order not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  let deletedorder;
  if (req.user.role === 'admin') {
    deletedorder = await Orders.findOneAndDelete({
      _id: req.params.orderId,
    });
  }

  if (!deletedorder) {
    return next(new appError('order not found', 404));
  }

  res.status(204).json({
    status: 'success',
    message: 'order deleted',
  });
});
