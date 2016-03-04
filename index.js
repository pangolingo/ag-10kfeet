'use strict';

// next steps:
// pull last week's entries and group by project/phase/task category

const TenKAPI = require('./api');
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
  let project = findProjectById(projects, entry.assignable_id);
  let projectName = 'UNKNOWN PROJECT';
  let phaseName = 'NO PHASE'
  if(project){
    projectName = project.name;
  }
  if(project && project.parent_id){
    phaseName = project.phase_name
  }
  return `${projectName} // ${phaseName} // ${entry.task || 'NO TASK'} -- ${entry.notes} -- ${entry.hours}` 
}


function onFetchUsers(response){
  let users = filterDevUsers(JSON.parse(response).data);
  // users = users.filter(function(user){ return user.dispay_name === "Dave Iverson"; })
  users.forEach(function(user){
    TenKAPI.fetchTimeEntries(user)
      .then(onFetchTimeEntries.bind(this, user))
  });
}

function onFetchProjects(response){
  projects = JSON.parse(response).data;
  TenKAPI.fetchUsers()
    .then(onFetchUsers);
}

function onFetchTimeEntries(user, response){
  let entries = JSON.parse(response).data;

  // for some reason, when "suggestions" are shown in 10k feet,
  // the api returns only the expected entries
  // but when "suggestions" are not show in 10k feet, the API returns an extra entry for each suggestion with 0 hours
  // this even happens if you explicitly ask the api not to return suggestions
  // and what's weird is that these extra entries have "is_suggestion" set to false
  entries = entries.filter(function(entry){
    return entry.hours > 0;
  });
  console.log(user.display_name, `has ${entries.length} entries`);
  console.log( entries.map(function(entry){ 
    return displayTimeEntry(projects, entry);
  }.bind({projects: projects})) );
}

TenKAPI.fetchProjects()
  .then(onFetchProjects)




