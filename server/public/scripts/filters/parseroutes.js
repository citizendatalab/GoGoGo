'use strict';

/**
 * @ngdoc filter
 * @name gogogoApp.filter:routesFilter
 * @function
 * @description
 * # routesFilter
 * Filter in the gogogoApp.
 */
angular.module('gogogoApp')
  .filter('parseRoutes', function () {
    return function (input) {

      //input = input.slice(0,input.length-4)
      var out = {};
      var lines = input.map(function(d,i){
        var properties = {
            tm: d.transport_method,
            distance: +d.distance_inkm,
            id: d['_id'],
            teamid: d.teamid,
            endDatetime: +d.endDatetime,
            startDatetime: +d.startDatetime
          }
        var line = polyline.decode(d.lineString);
        var lineString = turf.lineString(line, properties);
        var lineString = turf.simplify(lineString, 0.00001, true);

        return lineString
      })

      var teams = d3.nest()
        .key(function(d){return d.properties.teamid})
        .entries(lines)

      var teamsList = teams.map(function(d){
        return d.key;
      })

      out.routes = turf.flip(turf.featureCollection(lines))
      out.teams = teams;
      out.teamsList = teamsList;
      out.dates = [
        d3.min(input, function(d){return d.startDatetime}),
        d3.max(input, function(d){return d.endDatetime})
      ]

      out.dates[1] = d3.timeMinute.ceil(new Date(out.dates[1])).getTime();
      out.dates[0] = d3.timeMinute.floor(new Date(out.dates[0])).getTime();

      return out;

    };
  });
