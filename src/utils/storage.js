export const safeReadJson = (key, fallbackValue) => {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return fallbackValue;
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
};

export const safeWriteJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
