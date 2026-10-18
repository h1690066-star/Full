// Narxlar va sozlamalar. Frontend (src/pages/Cart.jsx va Checkout.jsx) dagi qiymatlar bilan bir xil bo'lishi kerak.
module.exports = {
  PROMO: { code: 'xonbozor', percent: 10 },
  TAX: 0,
  HANDLING: 0,
  SHIPPING: {
    free: { label: "Free (bepul yetkazish)", price: 0 },
    fast: { label: "Fast (tezkor yetkazish)", price: 0 },
    sched: { label: "Belgilangan sanada", price: 0 },
  },
};
