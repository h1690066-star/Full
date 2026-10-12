// Narxlar va sozlamalar. Frontend (src/pages/Cart.jsx va Checkout.jsx) dagi qiymatlar bilan bir xil bo'lishi kerak.
module.exports = {
  PROMO: { code: 'xonbozor', percent: 10 },
  TAX: 50,
  HANDLING: 29,
  SHIPPING: {
    free: { label: 'Free (oddiy yetkazish)', price: 0 },
    fast: { label: 'Fast (tezkor yetkazish)', price: 8.5 },
    sched: { label: 'Belgilangan sanada', price: 0 },
  },
};
