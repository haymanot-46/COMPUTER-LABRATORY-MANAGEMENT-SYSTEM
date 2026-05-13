// backend/utils/ethiopianDate.js
const moment = require('moment');

// Ethiopian calendar constants
const ETHIOPIAN_EPOCH = 1723856; // Julian day number for 1/1/1 EC
const ETHIOPIAN_MONTHS = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

// Gregorian to Ethiopian date conversion
class EthiopianDate {
  constructor(date = new Date()) {
    this.gregorianDate = new Date(date);
    this.ethiopianDate = this.toEthiopian(this.gregorianDate);
  }

  // Convert Gregorian to Ethiopian
  toEthiopian(gregorianDate) {
    const date = new Date(gregorianDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Ethiopian calendar is 7-8 years behind Gregorian
    let ethiopianYear = year - 8;
    let ethiopianMonth = month + 1;
    let ethiopianDay = day;
    
    // Adjust for the Ethiopian leap year cycle
    if (month >= 8) { // September or later (Ethiopian Meskerem)
      ethiopianYear = year - 7;
      ethiopianMonth = month - 8;
    } else {
      ethiopianMonth = month + 4;
    }
    
    // Pagume adjustment (13th month)
    if (ethiopianMonth === 13) {
      ethiopianMonth = 13;
    }
    
    return {
      year: ethiopianYear,
      month: ethiopianMonth,
      day: ethiopianDay,
      monthName: ETHIOPIAN_MONTHS[ethiopianMonth - 1] || 'Pagume'
    };
  }

  // Convert Ethiopian to Gregorian
  toGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
    let gregorianYear = ethiopianYear + 8;
    let gregorianMonth = ethiopianMonth + 7;
    let gregorianDay = ethiopianDay;
    
    if (ethiopianMonth >= 4) {
      gregorianYear = ethiopianYear + 7;
      gregorianMonth = ethiopianMonth - 4;
    }
    
    return new Date(gregorianYear, gregorianMonth, gregorianDay);
  }

  // Format Ethiopian date
  format(format = 'full') {
    const { year, month, day, monthName } = this.ethiopianDate;
    
    switch (format) {
      case 'full':
        return `${monthName} ${day}, ${year} EC`;
      case 'numeric':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      case 'short':
        return `${monthName} ${day}`;
      default:
        return `${monthName} ${day}, ${year} EC`;
    }
  }

  // Get Ethiopian year
  getYear() {
    return this.ethiopianDate.year;
  }

  // Get Ethiopian month
  getMonth() {
    return this.ethiopianDate.month;
  }

  // Get Ethiopian month name
  getMonthName() {
    return this.ethiopianDate.monthName;
  }

  // Get Ethiopian day
  getDay() {
    return this.ethiopianDate.day;
  }

  // Check if it's Pagume (13th month)
  isPagume() {
    return this.ethiopianDate.month === 13;
  }

  // Get Ethiopian season
  getSeason() {
    const month = this.ethiopianDate.month;
    if (month >= 1 && month <= 4) return 'Kiremt (Summer)';
    if (month >= 5 && month <= 8) return 'Bega (Autumn)';
    if (month >= 9 && month <= 12) return 'Tseday (Spring)';
    return 'Pagume (Extra)';
  }
}

// Helper functions
const getCurrentEthiopianDate = () => {
  const ethDate = new EthiopianDate();
  return ethDate.format('full');
};

const getEthiopianYear = () => {
  const ethDate = new EthiopianDate();
  return ethDate.getYear();
};

const getEthiopianMonth = () => {
  const ethDate = new EthiopianDate();
  return ethDate.getMonthName();
};

const isEthiopianLeapYear = (year) => {
  // Ethiopian leap year occurs every 4 years
  return (year + 1) % 4 === 0;
};

const getEthiopianDaysInMonth = (year, month) => {
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 30;
};

const ethiopianToGregorian = (year, month, day) => {
  const ethDate = new EthiopianDate();
  return ethDate.toGregorian(year, month, day);
};

const gregorianToEthiopian = (date) => {
  const ethDate = new EthiopianDate(date);
  return {
    year: ethDate.getYear(),
    month: ethDate.getMonth(),
    monthName: ethDate.getMonthName(),
    day: ethDate.getDay()
  };
};

// Get Ethiopian academic year
const getEthiopianAcademicYear = (date = new Date()) => {
  const ethDate = new EthiopianDate(date);
  const year = ethDate.getYear();
  const month = ethDate.getMonth();
  
  // Academic year starts in Meskerem (September/October)
  if (month >= 1 && month <= 6) {
    return `${year-1}/${year}`;
  }
  return `${year}/${year+1}`;
};

// Get Ethiopian semester
const getEthiopianSemester = (date = new Date()) => {
  const ethDate = new EthiopianDate(date);
  const month = ethDate.getMonth();
  
  if (month >= 1 && month <= 5) return 'First Semester';
  if (month >= 6 && month <= 10) return 'Second Semester';
  return 'Summer Session';
};

// Format Ethiopian date for display
const formatEthiopianDate = (date, format = 'full') => {
  const ethDate = new EthiopianDate(date);
  return ethDate.format(format);
};

// Get Ethiopian holiday names
const getEthiopianHolidays = (year) => {
  return {
    'Enkutatash': `${year}-01-01`, // Ethiopian New Year
    'Meskel': `${year}-01-17`,     // Finding of the True Cross
    'Timkat': `${year}-04-11`,     // Epiphany
    'Genna': `${year}-05-28`,      // Ethiopian Christmas
    'Fasika': `${year}-06-16`      // Ethiopian Easter
  };
};

// Calculate Ethiopian time (12-hour cycle starting at 6 AM)
const getEthiopianTime = (gregorianTime = new Date()) => {
  const hours = gregorianTime.getHours();
  const minutes = gregorianTime.getMinutes();
  
  // Ethiopian time: 6 AM = 12:00, 7 AM = 1:00, etc.
  let ethiopianHour = (hours + 6) % 12;
  if (ethiopianHour === 0) ethiopianHour = 12;
  
  const period = hours >= 6 && hours < 18 ? 'AM' : 'PM';
  
  return {
    hour: ethiopianHour,
    minute: minutes,
    period: period,
    formatted: `${ethiopianHour}:${minutes.toString().padStart(2, '0')} ${period}`
  };
};

module.exports = {
  EthiopianDate,
  getCurrentEthiopianDate,
  getEthiopianYear,
  getEthiopianMonth,
  isEthiopianLeapYear,
  getEthiopianDaysInMonth,
  ethiopianToGregorian,
  gregorianToEthiopian,
  getEthiopianAcademicYear,
  getEthiopianSemester,
  formatEthiopianDate,
  getEthiopianHolidays,
  getEthiopianTime
};