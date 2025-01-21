const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema(
  {
    name: { String },
    City: { String },
    State: { String },
    Address1: { String },
    Address2: { String },
    phoneNumber: { String },
    ReceivedOn: { String },
    status: {
      type: String,
    },
    totalPrice: {
      type: String,
    },
    totalItems: {
      type: String,
    },
    email: {
      type: String,
    },
    orderDate: {
      type: String,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: String,
        total: String,
        size: String,
      },
      ,
    ],
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
    id: false,
    timestamps: true,
  },
);

ordersSchema.index({ status: 1 });

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

const Orders = mongoose.model('Orders', ordersSchema);

module.exports = Orders;
