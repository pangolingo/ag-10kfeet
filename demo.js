'use strict';



const Moment = require('moment');
const tenkAPI = require('./index');


let printer = {
  print: function(str){
    console.log('#'+str);
  },
  break: function(){ console.log("—————————"); }
};

var formatter = {
  formatUserHeader: function(user, entries){
    let totalTime = tenkAPI.helpers.timeEntries.countTotalTime(entries);
    return `${user.display_name}: ${totalTime} hours (${entries.length} entries)`;
  },
  formatTimeEntry(entry){
    return `${entry.hours}\t${entry.project_name} / ${entry.phase_name}`;
  }
}

tenkAPI.displayTimeEntries({
  startDate: Moment().subtract(1, 'weeks').startOf('isoWeek').toISOString(),
  endDate: Moment().subtract(1, 'weeks').endOf('isoWeek').toISOString(),
  discipline: "Development"
}, printer, formatter);