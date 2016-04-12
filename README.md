#AG-10kFeet
This Node.js module uses the 10,000 Feet project management system's API to do some interesting things. It's primarily built to be integrated into a Hubot script.

Make sure to set your 10,000 feet authentication key as an environment variable: `TENKFEET_AUTHKEY=XXXXX`

##Usage
So far it just does one thing:

###Display Time Entries
Something like this (this code probably isn't quite right).

```javascript
const Moment = require('moment');
const displayTimeEntries = require('./displayTimeEntries');

displayTimeEntries({
  startDate: Moment().subtract(1, 'weeks').startOf('isoWeek').toISOString(),
  endDate: Moment().subtract(1, 'weeks').endOf('isoWeek').toISOString(),
  discipline: "Development"
}, console.log);
```