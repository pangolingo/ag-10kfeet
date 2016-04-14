'use strict';

// next steps:
// handle vacation
// merge into greerbot

const TenKAPI = require('./api');
const Helpers = require('./helpers');

const showTasks = false;
let projects;



function addProjectInfoToEntries(entries){
  return entries.map(function(entry){
    let project = Helpers.projects.findById(projects, entry.assignable_id);
    let projectName = 'UNKNOWN PROJECT';
    let phaseName = 'NO PHASE'
    if(project){
      projectName = project.name;
    }
    if(project && project.parent_id){
      phaseName = project.phase_name
    }
    entry.project_name = projectName;
    entry.phase_name = phaseName;
    return entry;
  });
}



var defaultFormatter = {
  formatUserHeader: function(user, entries){
    let totalTime = Helpers.timeEntries.countTotalTime(entries);
    return `${user.display_name} has ${entries.length} entries (${totalTime} hours)`;
  },
  formatTimeEntry(entry){
    return `${entry.project_name} // ${entry.phase_name} -- ${entry.hours}`;
  }
}

var defaultPrinter = {
  print: console.log,
  break: function(){ console.log("") }
}


module.exports = function(options, printer, formatter){

printer = printer || defaultPrinter;
formatter = formatter || defaultFormatter;

// DO IT!
return TenKAPI.fetchProjects()
  .then(function(response){
    // set global projects
    projects = JSON.parse(response).data;
    return projects;
  })
  .then(TenKAPI.fetchUsers.bind(TenKAPI))
  .then(function(response){
    return JSON.parse(response).data;
  })
  .then(function(users){
    return Helpers.users.filterByDiscipline(users, options.discipline);
  })
  .then(function(users){
    // for each user, fetch the time entries and display them
    // return a promise for when all users are done
    let usersPromises = users.map(function(user){
      return TenKAPI.fetchTimeEntries(user, options.startDate, options.endDate)
        .then(function(response){
          return JSON.parse(response).data;
        })
        .then(Helpers.timeEntries.filterOutSuggested)
        .then(addProjectInfoToEntries)
        .then(Helpers.timeEntries.groupSimilar)
        .then(function(entries){
          // SHOW STUFF HERE
          printer.print( formatter.formatUserHeader(user, entries) );
          entries.forEach(function(entry){ 
            printer.print( formatter.formatTimeEntry(entry) );
          }, this);
          printer.break();
          return entries;
        });
    });
    return Promise.all(usersPromises);
  })
  .catch(function(err){
    throw err;
  });
  
}; // end displayTimeEntries

