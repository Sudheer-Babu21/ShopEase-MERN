/**
 * Cart Calculation Service
 * Encapsulates pricing, discounts, and item aggregation
 */

/**
 * Calculates subtotal, discounted totals, and item counts for a cart
 * @param {Array} items - Array of cart items with populated product
 * @returns {Object} { subtotal, totalDiscount, grandTotal, totalCount }
 */
const calculateCartTotals = (items = []) => {
  let subtotal = 0;
  let totalCount = 0;

  items.forEach((item) => {
    if (item.product && item.product.price) {
      const price = Number(item.product.price) || 0;
      const qty = Number(item.quantity) || 1;
      subtotal += price * qty;
      totalCount += qty;
    }
  });

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalCount,
    grandTotal: Math.round(subtotal * 100) / 100,
  };
};

module.exports = {
  calculateCartTotals,
};
