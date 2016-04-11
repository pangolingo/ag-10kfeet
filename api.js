const Url = require('url');
const Request = require('request');
const Promise = require("bluebird");
const RequestPromise = require('request-promise');

const authKey = process.env.TENKFEET_AUTHKEY;

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

  fetchTimeEntries: function(user, start, end){
    return this.fetch(`api/v1/users/${user.id}/time_entries`, { 
      auth: authKey, 
      per_page: 1000, 
      from: start, 
      to: end 
    });
  },
  
  helpers: {
    findProjectById: function(projects, id){
      return projects.find(function(project){
        return project.id === id;
      });
    },
    filterUsersByDiscipline: function(users, discipline){
      return users.filter(function(user){
        return user.discipline === discipline;
      });
    }
  }

}