import mongoose from "mongoose";

const specItem = { _id: false, label: String, value: mongoose.Schema.Types.Mixed };

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    brand: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    used: { type: Boolean, default: false },
    grade: { type: String, default: "excellent" },
    battery: { type: Number, default: 95 },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    images: [String],
    imagesData: [{ _id: false, filename: String, data: String, mime: String }],
    colors: [String],
    storage: [String],
    specs: [specItem],
    quickSpecs: [specItem],
    specGroups: [{ _id: false, title: String, items: [specItem] }],
    delivery: { freeDelivery: String, inStock: String, guaranteed: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);

