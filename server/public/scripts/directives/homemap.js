'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:homemap
 * @description
 * # homemap
 */
angular.module('gogogoApp')
  .directive('homemap', function () {
    return {
      restrict: 'A',
      replace: false,
      link: function (scope, element, attrs) {
        mapboxgl.accessToken = 'pk.eyJ1IjoidGVvIiwiYSI6IllvZUo1LUkifQ.dirqtn275pAKdnqtLM2HSw';
        var map = new mapboxgl.Map({
            container: 'map-bg',
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [4.9000,52.3667],
            minZoom:12,
            maxZoom:17,
            zoom: 13,
            interactive:false
        });
      }
    };
  });
