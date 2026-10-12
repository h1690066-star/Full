const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],
    address: {
      title: String,
      text: String,
      phone: String,
      lat: Number,
      lon: Number,
    },
    shipping: { id: String, label: String, price: Number, date: String },
    promoCode: { type: String, default: '' },
    subtotal: Number,
    discount: Number,
    tax: Number,
    handling: Number,
    total: Number,
    paymentMethod: { type: String, default: 'card_transfer' },
    receipt: { type: String, default: '' }, // Fayl nomi yoki yo'li
    receiptData: { type: String, default: '' }, // Base64 saqlangan chek rasmi (Render qayta yuklanganda ham yo'qolmaydi)
    receiptMime: { type: String, default: 'image/jpeg' },
    status: { type: String, enum: ['new', 'confirmed', 'delivered', 'cancelled'], default: 'new' },
    telegramSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
