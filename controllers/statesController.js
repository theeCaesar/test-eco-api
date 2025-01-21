const Orders = require('../models/ordersModel');
const APIFeatures = require('../utils/APIFeatures');
const appError = require('../utils/appError');
const catchAsyncErrors = require('../utils/catchAsyncErrors');

exports.getTotalRevenue = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await Orders.aggregate([
      {
        $match: {
          state: 'Order Received',
        },
      },
      {
        $addFields: {
          numericPrice: {
            $toDouble: {
              $substr: ['$totalPrice', 1, -1], // Remove "$" and convert to double alway make sure the total price of orders is "$xx.xx"
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$numericPrice' },
        },
      },
    ]);
    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    res.status(200).json({ totalRevenue });
  } catch (error) {
    return next(new appError('Failed to calculate total revenue', 400));
  }
});

exports.getTotalCustomers = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await Orders.aggregate([
      {
        $group: {
          _id: '$phoneNumber',
        },
      },
      {
        $count: 'totalCustomers',
      },
    ]);

    const totalCustomers = result.length > 0 ? result[0].totalCustomers : 0;

    res.status(200).json({ totalCustomers });
  } catch (error) {
    return next(new appError('Error calculating total customers:', 400));
  }
});
