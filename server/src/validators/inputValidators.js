// Validation functions matching the reference project business logic

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const validateRegisterInput = ({ name, email, password, confirmPassword, phone }) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 8 characters long and contain both letters and numbers.');
  }

  if (password !== confirmPassword) {
    errors.push('Password and confirmation password do not match.');
  }

  if (phone && (typeof phone !== 'string' || phone.length > 20)) {
    errors.push('Phone number cannot exceed 20 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Please enter your password.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateProductInput = ({ name, category, price, stockQty }) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long.');
  }

  if (!category) {
    errors.push('A valid category must be selected.');
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    errors.push('Price must be a non-negative number.');
  }

  const numStock = Number(stockQty);
  if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
    errors.push('Stock quantity must be a non-negative integer.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateCheckoutInput = ({ shippingAddress, paymentMethod }) => {
  const errors = [];

  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
    errors.push('Please provide a complete shipping address (at least 5 characters).');
  }

  if (!paymentMethod || !['COD', 'MOCK'].includes(paymentMethod)) {
    errors.push("Payment method must be either 'COD' (Cash on Delivery) or 'MOCK' (Mock Payment).");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePasswordUpdate = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
    errors.push('New password must be at least 8 characters long and contain both letters and numbers.');
  }

  if (newPassword !== confirmPassword) {
    errors.push('New password and confirmation password do not match.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  validateRegisterInput,
  validateLoginInput,
  validateProductInput,
  validateCheckoutInput,
  validatePasswordUpdate,
};
