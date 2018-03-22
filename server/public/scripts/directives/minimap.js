'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:minimap
 * @description
 * # minimap
 */
angular.module('gogogoApp')
  .directive('minimap', function () {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        route: '='
      },
      link: function (scope, element, attrs) {

        var route = turf.flip(scope.route),
            width = 70,
            height = 70;

        var canvas = d3.select(element[0]).append("canvas")
        var context = canvas.node().getContext("2d");

        function getRetinaRatio() {
              var devicePixelRatio = window.devicePixelRatio || 1
              var backingStoreRatio = [
                  context.webkitBackingStorePixelRatio,
                  context.mozBackingStorePixelRatio,
                  context.msBackingStorePixelRatio,
                  context.oBackingStorePixelRatio,
                  context.backingStorePixelRatio,
                  1
              ].reduce(function(a, b) { return a || b })

              return devicePixelRatio / backingStoreRatio
          }

        var ratio = getRetinaRatio();

        canvas
          .attr("width", width*ratio)
          .attr("height", height*ratio)
          .style('width', width + 'px')
          .style('height', height + 'px');

        context.scale(ratio, ratio);

        var projection = d3.geoMercator().fitSize([width, height], route);

        var path = d3.geoPath()
          .projection(projection)
          .context(context);

        path(route);
        context.stroke();

      }
    };
  });
