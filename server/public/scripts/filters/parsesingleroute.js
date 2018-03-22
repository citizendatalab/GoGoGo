'use strict';

/**
 * @ngdoc filter
 * @name gogogoApp.filter:parseSingleRoute
 * @function
 * @description
 * # parseSingleRoute
 * Filter in the gogogoApp.
 */
angular.module('gogogoApp')
  .filter('parseSingleRoute', function () {
    return function (input) {
      var route = input[0].route;
      var id = input[0]._id;
      var startDatetime;
      var emotion;

      var routes = [];
      var routeEmotion = []
      route.forEach(function(d,i){
        if(d.coordinates.emotion != emotion){
          if(routeEmotion.length){
            var lineString = turf.lineString(routeEmotion, {emotion:emotion, id: id, startDatetime: startDatetime});
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
          var lineString = turf.lineString(routeEmotion, {emotion:emotion, id: id,startDatetime: startDatetime});
          routes.push(lineString)
        }
      })

      return turf.featureCollection(routes);
    };
  });
