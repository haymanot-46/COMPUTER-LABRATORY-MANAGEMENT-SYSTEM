// Ethiopian Calendar conversion utilities
export const ethiopianMonths = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
];

// Convert Gregorian to Ethiopian date
export const toEthiopianDate = (gregorianDate) => {
  const date = new Date(gregorianDate);
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth();
  const gregorianDay = date.getDate();
  
  // Ethiopian calendar offset
  let ethiopianYear = gregorianYear - 8;
  let ethiopianMonth = 0;
  let ethiopianDay = 0;
  
  // Simplified conversion (for demonstration)
  // In production, use a proper conversion library
  const dayOfYear = Math.floor((date - new Date(gregorianYear, 0, 0)) / (1000 * 60 * 60 * 24));
  
  if (dayOfYear < 274) {
    ethiopianMonth = Math.floor(dayOfYear / 30);
    ethiopianDay = (dayOfYear % 30) + 1;
  } else {
    ethiopianMonth = Math.floor((dayOfYear - 274) / 30);
    ethiopianDay = ((dayOfYear - 274) % 30) + 1;
    if (dayOfYear >= 365) {
      ethiopianYear++;
    }
  }
  
  return {
    year: ethiopianYear,
    month: ethiopianMonth,
    monthName: ethiopianMonths[ethiopianMonth],
    day: ethiopianDay
  };
};

// Format Ethiopian date
export const formatEthiopianDate = (date, format = 'full') => {
  const ethiopian = toEthiopianDate(date);
  
  switch (format) {
    case 'full':
      return `${ethiopian.monthName} ${ethiopian.day}, ${ethiopian.year} E.C.`;
    case 'short':
      return `${ethiopian.monthName.substring(0, 3)} ${ethiopian.day}, ${ethiopian.year}`;
    case 'numeric':
      return `${ethiopian.day}/${ethiopian.month + 1}/${ethiopian.year}`;
    default:
      return `${ethiopian.monthName} ${ethiopian.day}, ${ethiopian.year} E.C.`;
  }
};

// Get current Ethiopian date
export const getCurrentEthiopianDate = () => {
  return toEthiopianDate(new Date());
};

// Check if date is in Ethiopian calendar range
export const isValidEthiopianDate = (year, month, day) => {
  if (year < 1900 || year > 2100) return false;
  if (month < 0 || month > 12) return false;
  
  const maxDays = month === 12 ? 5 : 30;
  return day >= 1 && day <= maxDays;
};