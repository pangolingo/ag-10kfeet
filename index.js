'use strict';



// const Moment = require('moment');
// const displayTimeEntries = require('./displayTimeEntries');

// displayTimeEntries({
//   startDate: Moment().subtract(1, 'weeks').startOf('isoWeek').toISOString(),
//   endDate: Moment().subtract(1, 'weeks').endOf('isoWeek').toISOString(),
//   discipline: "Development"
// }, console.log);

module.exports = {
  displayTimeEntries: require('./displayTimeEntries')
}