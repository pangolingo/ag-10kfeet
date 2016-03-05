'use strict';

// next steps:
// pull last week's entries and group by project/phase/task category

const TenKAPI = require('./api');

const startDate = '2016-02-21T00:00:00Z';
const endDate = '2016-02-27T00:00:00Z';
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
  // let project = findProjectById(projects, entry.assignable_id);
  // let projectName = 'UNKNOWN PROJECT';
  // let phaseName = 'NO PHASE'
  // if(project){
  //   projectName = project.name;
  // }
  // if(project && project.parent_id){
  //   phaseName = project.phase_name
  // }
  // return `${projectName} // ${phaseName} // ${entry.task || 'NO TASK'} -- ${entry.notes} -- ${entry.hours}` 
  return `${entry.project_name} // ${entry.phase_name} // ${entry.task || 'NO TASK'} -- ${entry.hours}` 
}

// for some reason, node's findIndex array method doesn't pass in an index.
function findMatchAndReturnIndex(arr, matchFunction){
  for (let i = 0; i < arr.length; i++) {
    if( matchFunction(arr[i], i) ){
      return i;
    }
  }
  return -1;
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
  
  let groupedEntries = [];
  // for(let entry in entries){
  for(let i = 0; i < entries.length; i++){
    let entry = entries[i];
    let similarGroupedEntryIndex = findMatchAndReturnIndex(groupedEntries, function(groupedEntry, index){
      return entriesAreSimilar(entry, groupedEntry)
    });
    if(similarGroupedEntryIndex > -1){
      // append hours
      groupedEntries[similarGroupedEntryIndex].hours += entry.hours;
    } else {
      console.log("pushing")
      groupedEntries.push(entry);
    }
  }
  return groupedEntries;
}
function entriesAreSimilar(entry1, entry2){
  const keysToCheck = ['project_name', 'phase_name', 'task'];
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
  users = users.filter(function(user){ return user.display_name === "Dave Iverson"; });
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
  console.log(user.display_name, `has ${entries.length} entries`);
    console.log( entries.map(function(entry){ 
      return displayTimeEntry(projects, entry);
    }) );
  return entries;
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
