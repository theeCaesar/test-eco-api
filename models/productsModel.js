const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'insert the product name'],
    },
    images: {
      type: [String],
      required: [true, 'the product must have at least one image'],
    },
    thumbnail: {
      type: String,
      required: [true, 'the product must have thumbnail'],
    },
    description: {
      type: String,
      required: [true, 'the product must have a description'],
    },
    price: {
      type: Number,
      required: [true, 'the product must have a price'],
    },
    size: {
      type: [String],
    },
    category: {
      type: [String],
    },
    material: {
      type: String,
    },
    delivery_and_exchange_policy: {
      type: String,
    },
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
    id: false,
    timestamps: true,
  },
);

productsSchema.index({ price: 1 });
productsSchema.index({ tags: 1 });

//Later

// productsSchema.virtual('reviews', {
//   ref: 'Reviews',
//   foreignField: 'product',
//   localField: '_id',
// });

// productsSchema.pre(/^find/, async function(next) {
//     this.populate({
//         path: 'user',
//         select: 'displayName _id profilePicture'
//       })
//     next()
// })

const Products = mongoose.model('Products', productsSchema);

module.exports = Products;
