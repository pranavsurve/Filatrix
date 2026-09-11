const parseJsonField = (value, fallback = {}) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildPreviewImages = (files = [], imageUrl = '') => {
  const uploaded = files.map(file => `/uploads/images/${file.filename}`);
  const url = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (url && !uploaded.includes(url)) {
    return [url, ...uploaded];
  }
  return uploaded.length ? uploaded : (url ? [url] : []);
};

module.exports = { parseJsonField, buildPreviewImages };
