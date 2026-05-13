const assetService = require('./assetService');
const attendanceService = require('./attendanceService');
const backupService = require('./backupService');
const cleanupService = require('./cleanupService');
const sessionService = require('./sessionService');
const smsService = require('./smsService');
const storageService = require('./storageService');
const tokenService = require('./tokenService');
const userService = require('./userService');
const virusScanService = require('./virusScanService');

module.exports = {
  assetService,
  attendanceService,
  backupService,
  cleanupService,
  sessionService,
  smsService,
  storageService,
  tokenService,
  userService,
  virusScanService
};