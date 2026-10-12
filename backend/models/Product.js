const mongoose = require('mongoose');

const specItem = { _id: false, label: String, value: mongoose.Schema.Types.Mixed }; // value: matn yoki massiv

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    brand: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    used: { type: Boolean, default: false },
    grade: { type: String, default: 'excellent' },
    battery: { type: Number, default: 95 },

    price: { type: Number, required: true, min: 0 },         // hozirgi (chegirmali) narx
    oldPrice: { type: Number, min: 0 },                       // eski narx (ustiga chizilgan)
    discount: { type: Number, default: 0, min: 0, max: 100 }, // chegirma foizi

    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },

    images: [String],
    imagesData: [{ _id: false, filename: String, data: String, mime: String }],
    colors: [String],   // HEX, masalan '#000000'
    storage: [String],  // '128GB', '256GB' ...
    specs: [specItem],  // oddiy xususiyatlar jadvali
    quickSpecs: [specItem],
    specGroups: [{ _id: false, title: String, items: [specItem] }],
    delivery: { freeDelivery: String, inStock: String, guaranteed: String },
    ratingBreakdown: {
      excellent: { type: Number, default: 0 },
      good: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      belowAverage: { type: Number, default: 0 },
      poor: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
