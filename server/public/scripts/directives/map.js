'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:map
 * @description
 * # map
 */
angular.module('gogogoApp')
  .directive('map', ['$timeout', '$window', function ($timeout, $window){
    return {
      restrict: 'A',
      replace: false,
      link: function (scope, element, attrs) {

        mapboxgl.accessToken = 'pk.eyJ1IjoidGVvIiwiYSI6IllvZUo1LUkifQ.dirqtn275pAKdnqtLM2HSw';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            center: [4.9000,52.3667],
            minZoom:8,
            maxZoom:17,
            zoom: 13
        });

        var emotionMarker;

        map.addControl(new mapboxgl.NavigationControl());

        var update = function(data){
          map.addSource("routes", {
              "type": "geojson",
              "data": data
          })

          map.addLayer({
              "id": "routes",
              "type": "line",
              "source": "routes",
              "layout": {
                  "line-join": "round",
                  "line-cap": "round"
              },
              "paint": {
                  "line-color": "rgba(0,0,0,0.5)",
                  "line-width": 2
              }
          });

          map.addLayer({
              "id": "routes-hover",
              "type": "line",
              "source": "routes",
              "layout": {
                  "line-join": "round",
                  "line-cap": "round"
              },
              "paint": {
                  "line-color": "rgba(255,255,255,1)",
                  "line-width": 1,
                  "line-gap-width":3
              },
              "filter": ["==", "id", ""]
          });

          map.addLayer({
              "id": "routes-hover-in",
              "type": "line",
              "source": "routes",
              "layout": {
                  "line-join": "round",
                  "line-cap": "round"
              },
              "paint": {
                  "line-color": "#284347",
                  "line-width": 3
              },
              "filter": ["==", "id", ""]
          });



          map.on('mousemove', function (e) {
            //all routes
              var features = map.queryRenderedFeatures(e.point, { layers: ['routes'] });
              map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
              if (features.length) {
                  map.setFilter("routes-hover", ["==", "id", features[0].properties.id]);
                  map.setFilter("routes-hover-in", ["==", "id", features[0].properties.id]);
              } else {
                  map.setFilter("routes-hover", ["==", "id", ""]);
                  map.setFilter("routes-hover-in", ["==", "id", ""]);
              }
            //single team
            if(map.getSource('singleteam')){
              var featuresTeam = map.queryRenderedFeatures(e.point, { layers: ['singleteam'] });
              map.getCanvas().style.cursor = (featuresTeam.length) ? 'pointer' : '';
              if (featuresTeam.length) {
                  map.setFilter("singleteam", ["==", "id", featuresTeam[0].properties.id]);
              } else {
                if(map.getLayoutProperty('singleteam', 'visibility') == 'visible'){
                  var methods = ['in','tm'];
                  if(scope.filters.bike){
                    methods.push('bike')
                  }

                  if(scope.filters.walking){
                    methods.push('walking')
                  }

                  map.setFilter('singleteam',[
                    'all',
                    methods,
                    ['==', 'teamid', scope.filters.selectedTeam],
                    ['>', 'startDatetime', scope.filters.minValue],
                    ['<', 'endDatetime', scope.filters.maxValue]
                  ]);
                }
              }
            }
          });

          map.on('click', function (e) {
              var visibilityRoute = map.getLayoutProperty('routes', 'visibility');

              if(scope.filters.selectedTeam){
                map.setLayoutProperty('singleteam', 'visibility', 'visible');
                scope.removeSingleRoute();
                if(!scope.$$phase) {
                  scope.$apply()
                }
              }else if (!scope.filters.selectedTeam && visibilityRoute != 'visible') {
                  scope.removeSingleRoute();
                  if(!scope.$$phase) {
                    scope.$apply()
                  }
              }

              var features = map.queryRenderedFeatures(e.point, { layers: ['routes-hover'] });
              //var features = map.queryRenderedFeatures(e.point, { layers: ['routes'] });

              if (features.length){
                var feature = features[0];

                scope.getSingleRoute(feature.properties.teamid, feature.properties.id);

                var container = $('.routesContainer'),
                    scrollTo = $('#'+feature.properties.id);

                container.animate({
                    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - $('ddn-sticky-wrapper').height()
                });
              }

              if(scope.filters.selectedTeam){
                var featuresTeam = map.queryRenderedFeatures(e.point, { layers: ['singleteam'] });

                if (!featuresTeam.length) {
                    return;
                }else{
                  var featuresTeam = featuresTeam[0];

                  scope.getSingleRoute(featuresTeam.properties.teamid, featuresTeam.properties.id);

                  var container = $('.routesContainer'),
                      scrollTo = $('#'+featuresTeam.properties.id);

                  container.animate({
                      scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - $('ddn-sticky-wrapper').height()
                  });
                }
              }

          });

          // Reset the route-hover layer's filter when the mouse leaves the map
          map.on("mouseout", function() {
              map.setFilter("routes-hover", ["==", "id", ""]);
              map.setFilter("routes-hover-in", ["==", "id", ""]);
          });

          var bbox = turf.bbox(data);

          map.fitBounds([[
                bbox[0],
                bbox[1]
            ], [
                bbox[2],
                bbox[3]
            ]],{padding:100});
        }

      var updateSingle = function(data){
        map.setLayoutProperty('routes', 'visibility', 'none');
        map.setLayoutProperty('routes-hover', 'visibility', 'none');
        map.setLayoutProperty('routes-hover-in', 'visibility', 'none');
        if(map.getSource('singleteam')){
          map.setLayoutProperty('singleteam', 'visibility', 'none');
        }
        if(emotionMarker){
          emotionMarker.remove()
        }

        var startPoint = data.features[0].geometry.coordinates[0],
            endPoint = data.features[data.features.length-1].geometry.coordinates[data.features[data.features.length-1].geometry.coordinates.length-1];

        var startEnd = turf.featureCollection([
          turf.point(startPoint, {label:'start'}),
          turf.point(endPoint, {label:'end'})
        ])

        var singleRouteSource = map.getSource('singleroute');

        if(!singleRouteSource){
          map.addSource("singleroute", {
              "type": "geojson",
              "data": data
          })

          map.addSource("startend", {
              "type": "geojson",
              "data": startEnd
          })

          map.addLayer({
              "id": "singleroute",
              "type": "line",
              "source": "singleroute",
              "layout": {
                  "line-join": "round",
                  "line-cap": "round"
              },
              "paint": {
                  "line-color":{
                      property: 'emotion',
                      type: 'categorical',
                      stops: [
                          ['1', '#d7191c'],
                          ['2', '#fdae61'],
                          ['3', '#ffffbf'],
                          ['4', '#a6d96a'],
                          ['5', '#1a9641']]
                  },
                  "line-width": 3
              }
          });

          map.addLayer({
              "id": "startend",
              "type": "symbol",
              "source": "startend",
              "layout": {
                  "text-field": "{label}",
                  "text-transform": "uppercase",
                  "text-size": 12,
                  "text-offset": [0,1],
                  'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
              }
          });


          var bbox = turf.bbox(data);

          map.fitBounds([[
                bbox[0],
                bbox[1]
            ], [
                bbox[2],
                bbox[3]
            ]],{padding:100});

        }else {
          map.setLayoutProperty('singleroute', 'visibility', 'visible');
          map.setLayoutProperty('startend', 'visibility', 'visible');
          map.getSource('startend').setData(startEnd)
          singleRouteSource.setData(data);
          var bbox = turf.bbox(data);

          map.fitBounds([[
                bbox[0],
                bbox[1]
            ], [
                bbox[2],
                bbox[3]
            ]],{padding:100});
        }

      }

      var updateTeam = function(data){

        map.setLayoutProperty('routes', 'visibility', 'none');
        map.setLayoutProperty('routes-hover', 'visibility', 'none');
        map.setLayoutProperty('routes-hover-in', 'visibility', 'none');
        if(emotionMarker){
          emotionMarker.remove()
        }

        var singleTeamSource = map.getSource('singleteam');

        if(!singleTeamSource){
          map.addSource("singleteam", {
              "type": "geojson",
              "data": data
          })

          map.addLayer({
              "id": "singleteam",
              "type": "line",
              "source": "singleteam",
              "layout": {
                  "line-join": "round",
                  "line-cap": "round"
              },
              "paint": {
                  "line-color":{
                      property: 'emotion',
                      type: 'categorical',
                      stops: [
                          ['1', '#d7191c'],
                          ['2', '#fdae61'],
                          ['3', '#ffffbf'],
                          ['4', '#a6d96a'],
                          ['5', '#1a9641']]
                  },
                  "line-width": 3
              }
          });

          var bbox = turf.bbox(data);

          map.fitBounds([[
                bbox[0],
                bbox[1]
            ], [
                bbox[2],
                bbox[3]
            ]],{padding:100});

        }else {
          map.setLayoutProperty('singleteam', 'visibility', 'visible');
          //map.setLayoutProperty('startend', 'visibility', 'visible');
          //map.getSource('startend').setData(startEnd)
          singleTeamSource.setData(data);
          var bbox = turf.bbox(data);

          map.fitBounds([[
                bbox[0],
                bbox[1]
            ], [
                bbox[2],
                bbox[3]
            ]],{padding:100});
        }

      }

  		scope.$watch('routes.features.length', function(newValue, oldValue){
            if(newValue != oldValue && newValue){
              if(map.loaded()){
                update(scope.routes);
              }else{
                map.on('load', function () {
                  update(scope.routes);
                })
              }
            }//end if change
          })

      scope.$watch('mapCenter', function(newValue, oldValue){
            if(newValue != oldValue && newValue){

              if(emotionMarker){
                emotionMarker.remove();
              }
              var el = d3.select('body').append('div');

              el.append('i')
                .attr("class", function(){
                  var icon;
                  switch (newValue.emotion) {
                      case '1':
                          icon = "em-tired_face";
                          break;
                      case '2':
                          icon = "em-worried";
                          break;
                      case '3':
                          icon = "em-neutral_face";
                          break;
                      case '4':
                          icon = "em-blush";
                          break;
                      case '5':
                          icon = "em-smile";
                  }
                  return 'em ' + icon;
                })


              emotionMarker = new mapboxgl.Marker(el.node(),{'offset':[-9,-9]})
              	.setLngLat(newValue.center)
                .addTo(map);

              map.flyTo({center: newValue.center, zoom: 17});

            }//end if change
          },true)

      scope.$watch('singleRoute.features.length', function(newValue, oldValue){
            if(newValue != oldValue && newValue){
              if(map.loaded()){
                updateSingle(scope.singleRoute);
              }else{
                map.on('load', function () {
                  updateSingle(scope.singleRoute);
                })
              }
            }else if(newValue != oldValue && !newValue){

              if(!scope.filters.selectedTeam){
                map.setLayoutProperty('routes', 'visibility', 'visible');
                map.setLayoutProperty('routes-hover', 'visibility', 'visible');
                map.setLayoutProperty('routes-hover-in', 'visibility', 'visible');
              }else if(map.getSource('singleteam')){
                map.setLayoutProperty('singleteam', 'visibility', 'visible');
              }

              map.setLayoutProperty('singleroute', 'visibility', 'none');
              map.setLayoutProperty('startend', 'visibility', 'none');
              if(emotionMarker){
                emotionMarker.remove();
              }

            }//end if change
          })

        scope.$watch('singleTeam.features.length', function(newValue, oldValue){
              if(newValue != oldValue && newValue){
                //if(map.loaded()){
                  //updateTeam(scope.singleTeam);
                //}else{
                  //map.on('load', function () {
                    updateTeam(scope.singleTeam);
                  //})
                //}
              }else if(newValue != oldValue && !newValue){
                map.setLayoutProperty('routes', 'visibility', 'visible');
                map.setLayoutProperty('routes-hover', 'visibility', 'visible');
                map.setLayoutProperty('routes-hover-in', 'visibility', 'visible');
                map.setLayoutProperty('singleteam', 'visibility', 'none');
                // map.setLayoutProperty('startend', 'visibility', 'none');
                // if(map.getSource('emotion')){
                //   map.setLayoutProperty('emotion', 'visibility', 'none');
                //   map.setLayoutProperty('emotion-bg', 'visibility', 'none');
                // }

              }//end if change
            })

      scope.$watchGroup(['filters.bike', 'filters.walking','filters.selectedTeam','filters.minValue','filters.maxValue'], function(newValues, oldValues, scope) {

        if(newValues[3] && newValues[4] && map.getSource('routes')){
          scope.removeSingleRoute();
          var methods = ['in','tm'];

          if(newValues[0]){
            methods.push('bike')
          }

          if(newValues[1]){
            methods.push('walking')
          }

          if(newValues[2]){
            // map.setLayoutProperty('routes', 'visibility', 'visible');
            // map.setLayoutProperty('routes-hover', 'visibility', 'visible');
            // map.setLayoutProperty('routes-hover-in', 'visibility', 'visible');
            map.setFilter('routes',[
              'all',
              methods,
              ['==', 'teamid', newValues[2]],
              ['>', 'startDatetime', newValues[3]],
              ['<', 'endDatetime', newValues[4]]
            ]);

            if(map.getSource('singleteam')){
              map.setFilter('singleteam',[
                'all',
                methods,
                ['==', 'teamid', newValues[2]],
                ['>', 'startDatetime', newValues[3]],
                ['<', 'endDatetime', newValues[4]]
              ]);
            }

          }else{
            map.setLayoutProperty('routes', 'visibility', 'visible');
            map.setLayoutProperty('routes-hover', 'visibility', 'visible');
            map.setLayoutProperty('routes-hover-in', 'visibility', 'visible');
            map.setFilter('routes',[
              'all',
              methods,
              ['>', 'startDatetime', newValues[3]],
              ['<', 'endDatetime', newValues[4]]
            ]);
          }//end if team
        }//end if change

      });

      }
    };
  }]);
