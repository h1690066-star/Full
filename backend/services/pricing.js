const { PROMO, TAX, HANDLING, SHIPPING } = require('../config/shop');

const r2 = (n) => Math.round(n * 100) / 100;

// lines: [{ price, qty }]
exports.computeTotals = (lines, promoCode, shipId) => {
  const subtotal = Math.round(lines.reduce((a, l) => a + (Number(l.price) || 0) * (Number(l.qty) || 1), 0));
  const promoOk = !!promoCode && String(promoCode).trim().toLowerCase() === PROMO.code;
  const discount = promoOk ? Math.round((subtotal * PROMO.percent) / 100) : 0;
  const tax = TAX || 0;
  const handling = HANDLING || 0;
  const ship = SHIPPING[shipId] || SHIPPING.free;
  const shipPrice = ship ? (ship.price || 0) : 0;
  const total = Math.max(0, subtotal - discount + tax + handling + shipPrice);
  return { subtotal, discount, tax, handling, shipPrice, total, promoApplied: promoOk };
};
