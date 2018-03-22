'use strict';

/**
 * @ngdoc function
 * @name gogogoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the gogogoApp
 */
angular.module('gogogoApp')
  .controller('ExploreCtrl', function ($scope, apiservice) {
    $scope.routes,
    $scope.singleRoute,
    $scope.singleTeam,
    $scope.singleTeamAvg,
    $scope.teams,
    $scope.errors;
    $scope.filters = {
      bike: true,
      walking: true,
      selectedTeam: undefined,
      minValue:'',
      maxValue:''
    };
    $scope.isOpen = false;
    $scope.mapCenter;
    $scope.setCenter = function(center, emotion){
      $scope.mapCenter = {center: center, emotion:emotion};
    }

    var dateFormat = d3.timeFormat("%d/%m %H:%M");
    $scope.slider = {
      minValue: 0,
      maxValue: 0,
      options: {
          ceil:0,
          floor:0,
          step:1000*60,
          noSwitching:true,
          translate: function(value) {
            return dateFormat(new Date(value));
          },
          onEnd: function(sliderId, modelValue, highValue, pointerType){
            if(pointerType == 'min'){
                $scope.filters.minValue = modelValue;
            }else{
                $scope.filters.maxValue = highValue;
            }
          },
      }
    };

    $scope.onSelectedTeam = function(item, model, label, event){
      $scope.removeSingleRoute();
      $scope.searchTeam = '';
      $scope.filters.selectedTeam = item;
      $scope.getSingleTeam(item);
    }

    $scope.removeTeam = function(){
      $scope.filters.selectedTeam = undefined;
      $scope.singleTeamAvg = undefined;
      $scope.removeSingleTeam();
    }

    $scope.removeSingleRoute = function() {
      $scope.singleRoute = null;
    }

    $scope.removeSingleTeam = function() {
      $scope.singleTeam = null;
    }

    $scope.getSingleRoute = function(teamid, routeid){
      if(!$scope.singleRoute || routeid != $scope.singleRoute.features[0].properties.id){
        apiservice.getSingleRoute(teamid, routeid)
          .then(function(data){
            $scope.singleRoute = data;
            $scope.singleTeamAvg = d3.mean(data.features, function(d){
              return +d.properties.emotion;
            })
            $scope.singleTeamAvg = Math.round($scope.singleTeamAvg);
          },function(error){
            $scope.errors = error;
          });
      }else{
        $scope.removeSingleRoute();
      }
    }

    $scope.getSingleTeam = function(teamid){
        apiservice.getSingleTeam(teamid)
          .then(function(data){
            $scope.singleTeam = data;
          },function(error){
            $scope.errors = error;
          });
    }

    apiservice.getRoutes()
      .then(function(data){
          $scope.routes = data.routes;
          $scope.teams = data.teams;
          $scope.teamsList = data.teamsList;
          $scope.slider.minValue = data.dates[0];
          $scope.filters.minValue = data.dates[0];
          $scope.slider.options.floor = data.dates[0];
          $scope.slider.maxValue = data.dates[1];
          $scope.filters.maxValue = data.dates[1];
          $scope.slider.options.ceil = data.dates[1];
        },function(error){
          $scope.errors = error;
        })

  });
