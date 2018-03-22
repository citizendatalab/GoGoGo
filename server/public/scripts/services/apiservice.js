'use strict';

/**
 * @ngdoc service
 * @name gogogoApp.apiservice
 * @description
 * # apiservice
 * Factory in the gogogoApp.
 */
angular.module('gogogoApp')
  .factory('apiservice', function ($http, $q, parseRoutesFilter, parseSingleRouteFilter,parseSingleTeamFilter) {

    var BASE_API_URL = 'http://127.0.0.1';

    return {
      getFile : function(url){
        var deferred = $q.defer();
        $http.get(url).then(function(data){
          deferred.resolve(data.data);
        },function (error){
          deferred.reject("An error occured while fetching file");
        });

        return deferred.promise;
      },
     getRoutes : function(teamID, routeID){
       var deferred = $q.defer();
       var serviceUrl = '/getdataapp';
       var endPointUrl = teamID ? (routeID ? serviceUrl + '/' + teamID + '/' + routeID : serviceUrl + '/' + teamID) : serviceUrl;

       $http({
          method: 'GET',
          cache: false,
          url : BASE_API_URL + endPointUrl,
        }).then(function(data){
         deferred.resolve(parseRoutesFilter(data.data));
        },function (error){
         deferred.reject('An error occured while fetching data');
       });



       return deferred.promise;
     },
     getSingleRoute : function(teamID, routeID){
       var deferred = $q.defer();
       var serviceUrl = '/getdataapp';
       var endPointUrl = serviceUrl + '/' + teamID + '/' + routeID;

       $http({
          method: 'GET',
          cache: false,
          url : BASE_API_URL + endPointUrl,
        }).then(function(data){
         deferred.resolve(parseSingleRouteFilter(data.data));
      },function (error){
         deferred.reject('An error occured while fetching data');
       });

       return deferred.promise;
     },
     getSingleTeam : function(teamID){
       var deferred = $q.defer();
       var serviceUrl = '/getdataapp';
       var endPointUrl = serviceUrl + '/' + teamID;

       $http({
          method: 'GET',
          cache: false,
          url : BASE_API_URL + endPointUrl,
        }).then(function(data){
         deferred.resolve(parseSingleTeamFilter(data.data));
        },function (error){
         deferred.reject('An error occured while fetching data');
       });

       return deferred.promise;
     },
     getRoutesAll : function(){
       var deferred = $q.defer();
       var serviceUrl = '/getfulldataapp';
       var endPointUrl = serviceUrl;

       $http({
          method: 'GET',
          cache: false,
          url : BASE_API_URL + endPointUrl,
        }).then(function(data){
         deferred.resolve(data.data);
        },function (error){
         deferred.reject('An error occured while fetching data');
       });

       return deferred.promise;
     }
    };
  });
