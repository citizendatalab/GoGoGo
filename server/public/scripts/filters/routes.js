'use strict';

/**
 * @ngdoc filter
 * @name gogogoApp.filter:routes
 * @function
 * @description
 * # routes
 * Filter in the gogogoApp.
 */
angular.module('gogogoApp')
  .filter('routes', function () {
    return function (input,filters){
      var teams = input;
      if(teams){
        teams.forEach(function(t){
          var count = 0;
          t.values.forEach(function(d){

            var bike = filters.bike?'bike':false,
                walking = filters.walking?'walking':false;

            var time = d.properties.startDatetime>=filters.minValue?(d.properties.endDatetime<=filters.maxValue?true:false):false;
            if(d.properties.tm == bike || d.properties.tm == walking && time){
              d.properties.show = true
              count++
            }else{
              d.properties.show = false
            }
          })
          t.shown = count;
        })
      return teams;
      }
    };
  });
