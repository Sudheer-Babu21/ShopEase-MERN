// Currency formatter matching reference project (INR / ₹)
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Category icon helper matching reference project getCategoryIcon
export const getCategoryIcon = (catName) => {
  if (!catName) return 'bi-tag-fill';
  const lower = catName.toLowerCase();
  if (lower.contains ? lower.contains('electronic') : lower.includes('electronic')) return 'bi-laptop';
  if (lower.includes('fashion') || lower.includes('clothing')) return 'bi-bag-heart';
  if (lower.includes('shoe') || lower.includes('footwear')) return 'bi-boot';
  if (lower.includes('home') || lower.includes('kitchen')) return 'bi-house-heart';
  if (lower.includes('beauty') || lower.includes('personal')) return 'bi-flower1';
  if (lower.includes('book') || lower.includes('education')) return 'bi-book-half';
  if (lower.includes('sport') || lower.includes('fitness')) return 'bi-activity';
  if (lower.includes('watch') || lower.includes('bag') || lower.includes('accessor')) return 'bi-watch';
  if (lower.includes('toy') || lower.includes('game')) return 'bi-controller';
  if (lower.includes('office') || lower.includes('stationery')) return 'bi-pen-fill';
  return 'bi-tag-fill';
};

// Image URL resolver with fallback to placeholder
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/placeholder.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `/${imagePath}`;
};

// Date formatter
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
