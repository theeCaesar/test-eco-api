const Products = require('../models/productsModel');
const APIFeatures = require('../utils/APIFeatures');
const appError = require('../utils/appError');
const deletefiles = require('../utils/deletefiles');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('not image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 6 },
]);

exports.resizeProductImages = catchAsyncErrors(async (req, res, next) => {
  if (req.method === 'POST') {
    if (!req.files.images || !req.files.thumbnail)
      return next(
        new appError('product must have thumbnail and at least one image', 400),
      );
  }
  if (req.files) {
    if (req.files.thumbnail) {
      req.body.thumbnail = `productThumbnail-${
        req.user._id
      }-${Date.now()}.jpeg`;

      await sharp(req.files.thumbnail[0].buffer)
        .resize(500, 500, { fit: 'contain' })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/product/${req.body.thumbnail}`);
    }

    if (req.files.images) {
      req.body.images = [];

      await Promise.all(
        req.files.images.map(async (file, index) => {
          filename = `productImages-${req.user._id}-${Date.now()}-${
            index + 1
          }.jpeg`;
          await sharp(file.buffer)
            .resize(500, 500, { fit: 'contain' })
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/product/${filename}`);

          req.body.images.push(filename);
        }),
      );
    }
  }
  next();
});

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Products.find(), req.query)
    .filter()
    .sort()
    .paginaaton()
    .selectFields();

  const products = await features.query;

  if (!products) {
    return next(new appError('product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  if (req.body.json) {
    const json = JSON.parse(req.body.json);
    json.thumbnail = req.body.thumbnail;
    json.images = req.body.images;
    newProduct = await Products.create(json);
  } else {
    return next(new appError('please insert json key with form-data', 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      Product: newProduct,
    },
  });
});

exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Products.findById(req.params.productId);
  if (!product) {
    return next(new appError('product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  if (req.body.json) {
    const json = JSON.parse(req.body.json);
    if (req.body.thumbnail) json.thumbnail = req.body.thumbnail;
    if (req.body.images) json.images = req.body.images;
    json.user = req.user._id;
    updatedProduct = await Products.findOneAndUpdate(
      { _id: req.params.productId, user: req.user._id },
      json,
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    return next(new appError('please insert json key with form-data', 400));
  }
  if (!updatedProduct) {
    return next(new appError('product not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let deletedProduct;
  if (req.user.role === 'admin') {
    deletedProduct = await Products.findOneAndDelete({
      _id: req.params.productId,
    });
  }

  if (!deletedProduct) {
    return next(new appError('product not found', 404));
  }

  await deletefiles(
    [
      `public/images/product/${deletedProduct.thumbnail}`,
      `public/images/product/${deletedProduct.images}`,
    ],
    next,
  );
  res.status(204).json({
    status: 'success',
    message: 'product deleted',
  });
});
