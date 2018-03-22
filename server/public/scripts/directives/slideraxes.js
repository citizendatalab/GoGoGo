'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:sliderAxes
 * @description
 * # sliderAxes
 */
angular.module('gogogoApp')
  .directive('slideraxes', function () {
    return {
      restrict: 'A',
      replace: false,
      link: function (scope, element, attrs) {

        var selection = d3.select(element[0]),
            width = element[0].getBoundingClientRect().width,
            height = 30;

        var margin = {top: 5, right: 0, bottom: 5, left: 0},
            chartWidth = width - margin.left - margin.right,
            chartHeight = height - margin.top - margin.bottom;

        var chart = selection.append('svg')
          .attr('width', width)
          .attr('height', height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xMin = new Date(scope.slider.options.floor),
            xMax = new Date(scope.slider.options.ceil);

        var x = d3.scaleTime()
          .domain([xMin,xMax])
          .range([0, chartWidth]);

        var xAxis = d3.axisBottom(x)
          .tickSizeOuter(0);

        chart.call(xAxis);

        scope.$watch('slider.options', function(newValue, oldValue){
              if(newValue != oldValue){
                var xMin = new Date(newValue.floor),
                    xMax = new Date(newValue.ceil);
                x.domain([xMin,xMax]);
                chart.call(xAxis);
              }//end if change
        },true)

      }
    };
  });
