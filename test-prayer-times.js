// Test script to verify prayer times accuracy
const { testPrayerTimesAccuracy } = require('./src/lib/prayer-times/prayerTimesService.ts');

console.log('Testing prayer times accuracy against hamariweb.com data...');
testPrayerTimesAccuracy();
