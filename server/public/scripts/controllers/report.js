'use strict';

/**
 * @ngdoc function
 * @name gogogoApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the gogogoApp
 */
angular.module('gogogoApp')
  .controller('ReportCtrl', function ($scope, apiservice, parseSingleTeamFilter,$location) {
    $scope.rawRoutes;
    $scope.routes;
    $scope.gridFeatures;
    $scope.grid;
    $scope.reportType = 'all';
    $scope.totalTeams = 0;
    $scope.totalRoutes = 0;
    $scope.dataPoints = 0;
    $scope.areas = 0;
    $scope.poi = 0;
    $scope.poiDataPoints = 0;
    $scope.loading = true;

    var myWorker = new Worker("worker/collect.js");

    $scope.checkReport = function(type){
      return $scope.reportType === type;
    }
  
    apiservice.getFile('data/ams_grid.json')
      .then(function(grid){
        $scope.grid = grid;
        apiservice.getRoutesAll()
          .then(function(data){
              $scope.rawRoutes = data;
              $scope.routes = parseSingleTeamFilter(data);
              $scope.totalRoutes = data.length;
              $scope.totalTeams = d3.nest().key(function(d){return d.teamid}).entries(data).length;
              data.forEach(function(d){
                $scope.dataPoints = $scope.dataPoints + d.route.length;
              })
              $scope.computeGrid(data, grid);
            },function(error){
              $scope.errors = error;
            })
      },
      function(error){
        $scope.errors = error;
      }
    )

    $scope.computeGrid = function(input, grid) {
      //var requireWorker = Webworker.create(requireTurf, {async: true});
      myWorker.postMessage({input:input, grid:grid});

      //requireWorker.run(input, grid).then(function(result) {
      myWorker.onmessage = function (result) {
        var aggregated = result.data;
        aggregated.features = aggregated.features.filter(function(feature){
          return feature.properties.emotions.length;
        })

        aggregated.features.forEach(function(feature,i){
          feature.properties.id = 'id_' + i;
          feature.properties.count = feature.properties.emotions.length;
          var mode = d3.nest().key(function(k){return k}).entries(feature.properties.emotions);
          mode = mode.sort(function(a,b){return d3.descending(a.values.length, b.values.length)})
          feature.properties.emotions = mode[0].key;
        })

        $scope.gridFeatures = aggregated;
        $scope.areas = $scope.gridFeatures.features.length;

        //compute POI
        apiservice.getFile('data/poi.json')
          .then(
            function(poi){
              var fc = []

              $scope.poi = poi.features.length;
              poi.features.forEach(function(d){
                $scope.gridFeatures.features.forEach(function(e){
                  if(turf.inside(d,e)){
                    e.properties.name = d.properties.name;
                    e.properties.category = d.properties.category;
                    fc.push(e);
                    $scope.poiDataPoints = $scope.poiDataPoints + e.properties.count;
                  }
                })
              })
              $scope.poiGrid = turf.featureCollection(fc);
              $scope.loading = false;
            },
            function(error){
              console.log(error)
            }
            )
        //end
      //});
      }
    };

    // function requireTurf(input, grid) {
    //   importScripts("https://npmcdn.com/@turf/turf@3.5.1/turf.min.js");
    //
    //   var ptFC = [];
    //   input.forEach(function(route){
    //     route.route.forEach(function(point){
    //       ptFC.push(turf.point([+point.coordinates.longitude, +point.coordinates.latitude], {emotion: point.coordinates.emotion}));
    //     })
    //   })
    //   ptFC = turf.featureCollection(ptFC);
    //
    //   return complete(turf.collect(grid, ptFC, 'emotion', 'emotions'));
    // }

  });
