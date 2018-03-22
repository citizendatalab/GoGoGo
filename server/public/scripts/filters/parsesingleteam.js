'use strict';

/**
 * @ngdoc filter
 * @name gogogoApp.filter:parseSingleTeam
 * @function
 * @description
 * # parseSingleTeam
 * Filter in the gogogoApp.
 */
angular.module('gogogoApp')
  .filter('parseSingleTeam', function () {
    return function (input) {
      var routes = [];
      input.forEach(function(e){
        var route = e.route;
        var id = e._id;
        var teamid = e.teamid;
        var tm = e.transport_method;
        var startDatetime = e.startDatetime;
        var endDatetime = e.endDatetime;
        var emotion;
        var routeEmotion = [];
        route.forEach(function(d,i){
          if(d.coordinates.emotion != emotion){
            if(routeEmotion.length){
              var lineString = turf.lineString(routeEmotion, {emotion:emotion, id: id, teamid: teamid, tm: tm,startDatetime: startDatetime, endDatetime:endDatetime, chunkid: id+startDatetime});
              routes.push(lineString)
              startDatetime = Math.round(+d.timestamp)
              routeEmotion = [routeEmotion[routeEmotion.length-1]]
            }else {
              routeEmotion = [];
            }
            startDatetime = Math.round(+d.timestamp)
            emotion = d.coordinates.emotion
            routeEmotion.push([+d.coordinates.longitude,+d.coordinates.latitude])
          }else{
            routeEmotion.push([+d.coordinates.longitude,+d.coordinates.latitude])
          }
          if(i == route.length-1){
            var lineString = turf.lineString(routeEmotion, {emotion:emotion, id: id, teamid: teamid, tm: tm,startDatetime: startDatetime,endDatetime:endDatetime, chunkid: id+startDatetime});
            routes.push(lineString)
          }
        })
      })
      return turf.featureCollection(routes);
    };
  });
