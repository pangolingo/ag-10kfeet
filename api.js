const Url = require('url');
const Request = require('request');
const Promise = require("bluebird");
const RequestPromise = require('request-promise');

const authKey = 'aktiYk51K25wTWYxSDlzZ3hRdXdvK2EvNTdibjNsLzU0WHlQUU95N1k1R1V5cTlyVmVaVHFTbHRDWkVtCkkvTW9IM1I0QXRlcEtrUU9ZVEs4S21ENXZXcVdCYkluNWNubGIxd2FwVFdLdTRGRjRKOVkxTGp3S1ZueQpFcDhLbEJTMgo='

module.exports = {

  fetch: function(path, query){
    const endpoint = Url.format({
      protocol: 'https',
      host: 'api.10000ft.com',
      pathname: path,
      query: query
    });
    const headers = {
      'Content-Type': 'application/json'
    }
    return RequestPromise({url: endpoint, headers: headers});
  },

  fetchProjects: function(){
    return this.fetch('api/v1/projects', { auth: authKey, per_page: 1000, with_phases: true });
  },

  fetchUsers: function(){
    return this.fetch('api/v1/users', { auth: authKey, per_page: 100 });
  },

  fetchTimeEntries: function(user){
    return this.fetch(`api/v1/users/${user.id}/time_entries`, { 
      auth: authKey, 
      per_page: 1000, 
      from: '2016-02-26T00:00:00Z', 
      to: '2016-02-26T00:00:00Z' 
    });
  }


}