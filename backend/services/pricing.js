const { PROMO, TAX, HANDLING, SHIPPING } = require('../config/shop');

const r2 = (n) => Math.round(n * 100) / 100;

// lines: [{ price, qty }]
exports.computeTotals = (lines, promoCode, shipId) => {
  const subtotal = r2(lines.reduce((a, l) => a + l.price * l.qty, 0));
  const promoOk = !!promoCode && String(promoCode).trim().toLowerCase() === PROMO.code;
  const discount = promoOk ? r2((subtotal * PROMO.percent) / 100) : 0;
  const tax = subtotal > 0 ? TAX : 0;
  const handling = subtotal > 0 ? HANDLING : 0;
  const ship = SHIPPING[shipId] || SHIPPING.free;
  const shipPrice = subtotal > 0 ? ship.price : 0;
  const total = r2(subtotal - discount + tax + handling + shipPrice);
  return { subtotal, discount, tax, handling, shipPrice, total, promoApplied: promoOk };
};
