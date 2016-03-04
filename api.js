const Url = require('url');
const Request = require('request');
const Promise = require("bluebird");
const RequestPromise = require('request-promise');

const authKey = 'aktiYk51K25wTWYxSDlzZ3hRdXdvK2EvNTdibjNsLzU0WHlQUU95N1k1R1V5cTlyVmVaVHFTbHRDWkVtCkkvTW9IM1I0QXRlcEtrUU9ZVEs4S21ENXZXcVdCYkluNWNubGIxd2FwVFdLdTRGRjRKOVkxTGp3S1ZueQpFcDhLbEJTMgo='

module.exports = {


fetchProjects: function(){
  const endpoint = Url.format({
    protocol: 'https',
    host: 'api.10000ft.com',
    pathname: 'api/v1/projects',
    query: { auth: authKey, per_page: 1000, with_phases: true }
  });
  const headers = {
    'Content-Type': 'application/json'
  }
  return RequestPromise({url: endpoint, headers: headers});
},

fetchUsers: function(){
  const endpoint = Url.format({
    protocol: 'https',
    host: 'api.10000ft.com',
    pathname: 'api/v1/users',
    query: { auth: authKey, per_page: 100 }
  });
  const headers = {
    'Content-Type': 'application/json'
  }
  return RequestPromise({url: endpoint, headers: headers});
},

fetchTimeEntries: function(user){
  const endpoint = Url.format({
    protocol: 'https',
    host: 'api.10000ft.com',
    pathname: `api/v1/users/${user.id}/time_entries`,
    query: { auth: authKey, per_page: 1000, from: '2016-02-26T00:00:00Z', to: '2016-02-26T00:00:00Z' }
  });
  const headers = {
    'Content-Type': 'application/json'
  }
  return RequestPromise({url: endpoint, headers: headers});
}


}