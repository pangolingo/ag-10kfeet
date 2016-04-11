'use strict';

// next steps:
// handle vacation
// merge into greerbot

const TenKAPI = require('./api');

const showTasks = false;
let projects;



function addProjectInfoToEntries(entries){
  return entries.map(function(entry){
    let project = TenKAPI.helpers.findProjectById(projects, entry.assignable_id);
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


// group time entries with the same project, phase and task
function groupSimilarEntries(entries){
  let uniqueEntries = [];
  for(let i = 0; i < entries.length; i++){
    let entry = entries[i];
    let similarEntryIndex = uniqueEntries.findIndex(function(groupedEntry){
      return entriesAreSimilar(entry, groupedEntry)
    });
    if(similarEntryIndex < 0){
      // we don't have a similar entry yet
      uniqueEntries.push(entry);
    } else {
      // we have a similar entry. append hours
      uniqueEntries[similarEntryIndex].hours += entry.hours;
    }
  }
  return uniqueEntries;
}
function entriesAreSimilar(entry1, entry2){
  let keysToCheck;
  if(showTasks){
    keysToCheck = ['project_name', 'phase_name', 'task'];
  } else {
    keysToCheck = ['project_name', 'phase_name'];
  }
  for(let i = 0; i < keysToCheck.length; i++){
    let key = keysToCheck[i];
    if(entry1[key] !== entry2[key]){
      return false;
    };
  }
  return true
}


// for some reason, when "suggestions" are shown in 10k feet,
// the api returns only the expected entries
// but when "suggestions" are not show in 10k feet, the API returns an extra entry for each suggestion with 0 hours
// this even happens if you explicitly ask the api not to return suggestions
// and what's weird is that these extra entries have "is_suggestion" set to false
function filterTimeEntries(entries){
   return entries.filter(function(entry){
    return entry.hours > 0;
  });
}

function countTotalTime(entries){
  return entries.reduce(function(total, entry){
    return total + entry.hours;
  }, 0);
}

function formatTimeEntry(entry){
  return `${entry.project_name} // ${entry.phase_name} -- ${entry.hours}`;
}
function formatUserInformation(user, entries){
  let totalTime = countTotalTime(entries);
  return `${user.display_name} has ${entries.length} entries (${totalTime} hours)`;
}


module.exports = function(options, displayFunction){

// DO IT!
TenKAPI.fetchProjects()
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
    return TenKAPI.helpers.filterUsersByDiscipline(users, options.discipline);
  })
  .then(function(users){
    // for each user, fetch the time entries and display them
    // return a promise for when all users are done
    let usersPromises = users.map(function(user){
      return TenKAPI.fetchTimeEntries(user, options.startDate, options.endDate)
        .then(function(response){
          return JSON.parse(response).data;
        })
        .then(filterTimeEntries)
        .then(addProjectInfoToEntries)
        .then(groupSimilarEntries)
        .then(function(entries){
          // SHOW STUFF HERE
          displayFunction( formatUserInformation(user, entries) );
          entries.forEach(function(entry){ 
            displayFunction( formatTimeEntry(entry) );
          }, this);
          return entries;
        });
    });
    return Promise.all(usersPromises);
  })
  .catch(function(err){
    throw err;
  });
  
}; // end displayTimeEntries

