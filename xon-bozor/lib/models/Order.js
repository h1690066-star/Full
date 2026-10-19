import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    customer: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      telegram: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
        productId: { type: String, default: "" },
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
      region: String,
      district: String,
      street: String,
      lat: Number,
      lon: Number,
    },
    shipping: {
      id: { type: String, default: "free" },
      label: { type: String, default: "Toshkent bo'yicha yetkazish" },
      price: { type: Number, default: 0 },
      date: { type: String, default: "" },
    },
    promoCode: { type: String, default: "" },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    handling: { type: Number, default: 0 },
    total: Number,
    paymentMethod: { type: String, default: "card" },
    receipt: { type: String, default: "" },
    receiptData: { type: String, default: "" },
    receiptMime: { type: String, default: "image/jpeg" },
    status: { type: String, enum: ["new", "confirmed", "delivered", "cancelled"], default: "new" },
    telegramSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
