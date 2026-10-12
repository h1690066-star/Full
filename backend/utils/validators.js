// +998 90 123 45 67 / 901234567 / 998901234567 -> +998901234567
exports.normPhone = (v) => {
  if (!v) return undefined;
  let d = String(v).replace(/\D/g, '');
  if (d.length === 9) d = '998' + d;
  return d.length >= 11 && d.length <= 15 ? '+' + d : null; // null = notogri
};

exports.emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
