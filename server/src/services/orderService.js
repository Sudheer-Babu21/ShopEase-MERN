/**
 * Order Domain Service
 * Enforces business logic for order numbering and state machine transitions
 */

const VALID_TRANSITIONS = {
  PLACED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Validates if an order status change is permitted under the finite state machine rules
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
const isValidStatusTransition = (currentStatus, nextStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

/**
 * Generates human-friendly sequential order numbers
 * @param {number} seq
 * @returns {string} e.g. ORD-10001
 */
const formatOrderNumber = (seq) => {
  return `ORD-${10000 + Number(seq)}`;
};

module.exports = {
  VALID_TRANSITIONS,
  isValidStatusTransition,
  formatOrderNumber,
};
