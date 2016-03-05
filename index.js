'use strict';

// next steps:
// pull last week's entries and group by project/phase/task category

const TenKAPI = require('./api');

const startDate = '2016-02-21T00:00:00Z';
const endDate = '2016-02-27T00:00:00Z';
const showTasks = false;
let projects;

function filterDevUsers(users){
  return users.filter(function(user){
    return user.discipline === "Development";
  });
}

function findProjectById(projects, id){
  return projects.find(function(project){
    return project.id === id;
  });
}

function displayTimeEntry(projects, entry){
  // return `${projectName} // ${phaseName} // ${entry.task || 'NO TASK'} -- ${entry.notes} -- ${entry.hours}` 
  if(showTasks){
    return `${entry.project_name} // ${entry.phase_name} // ${entry.task || 'NO TASK'} -- ${entry.hours}`
  } else {
    return `${entry.project_name} // ${entry.phase_name} -- ${entry.hours}`
  } 
}


function addProjectInfoToEntries(entries){
  return entries.map(function(entry){
    let project = findProjectById(projects, entry.assignable_id);
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


function filterUsers(users){
  users = filterDevUsers(users);
  // users = users.filter(function(user){ return user.display_name === "Dave Iverson"; });
  return users;
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
function displayTimeEntries(user, entries){
  let totalTime = countTotalTime(entries);
  console.log(user.display_name, `has ${entries.length} entries (${totalTime} hours)`);
    console.log( entries.map(function(entry){ 
      return displayTimeEntry(projects, entry);
    }) );
  return entries;
}
function countTotalTime(entries){
  return entries.reduce(function(total, entry){
    return total + entry.hours;
  }, 0);
}


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
  .then(filterUsers)
  .then(function(users){
    // for each user, fetch the time entries and display them
    // return a promise for when all users are done
    let usersPromises = users.map(function(user){
      return TenKAPI.fetchTimeEntries(user, startDate, endDate)
        .then(function(response){
          return JSON.parse(response).data;
        })
        .then(filterTimeEntries)
        .then(addProjectInfoToEntries)
        .then(groupSimilarEntries)
        .then(displayTimeEntries.bind(null, user))
    })
    return Promise.all(usersPromises);
  })
  .catch(function(err){
    throw err;
  });
