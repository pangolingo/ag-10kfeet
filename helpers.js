'use strict';

const helpers = {
  timeEntries: {

    // for some reason, when "suggestions" are shown in 10k feet,
    // the api returns only the expected entries
    // but when "suggestions" are not show in 10k feet, the API returns an extra entry for each suggestion with 0 hours
    // this even happens if you explicitly ask the api not to return suggestions
    // and what's weird is that these extra entries have "is_suggestion" set to false
    filterOutSuggested: function(entries){
       return entries.filter(function(entry){
        return entry.hours > 0;
      });
    },

    countTotalTime: function(entries){
      return entries.reduce(function(total, entry){
        return total + entry.hours;
      }, 0);
    },

    // group time entries with the same project, phase and task
    groupSimilar: function(entries){
      let uniqueEntries = [];
      for(let i = 0; i < entries.length; i++){
        let entry = entries[i];
        let similarEntryIndex = uniqueEntries.findIndex(function(groupedEntry){
          return helpers.timeEntries.areSimilar(entry, groupedEntry)
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
    },

    areSimilar: function(entry1, entry2){
      let keysToCheck;
      // if(showTasks){
      //   keysToCheck = ['project_name', 'phase_name', 'task'];
      // } else {
        keysToCheck = ['project_name', 'phase_name'];
      // }
      for(let i = 0; i < keysToCheck.length; i++){
        let key = keysToCheck[i];
        if(entry1[key] !== entry2[key]){
          return false;
        };
      }
      return true
    }
  },
  projects: {
    findById: function(projects, id){
      return projects.find(function(project){
        return project.id === id;
      });
    }
  },
  users: {
    filterByDiscipline: function(users, discipline){
      return users.filter(function(user){
        return user.discipline === discipline;
      });
    }
  }
}


module.exports = helpers;