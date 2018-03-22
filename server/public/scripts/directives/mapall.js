'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:mapall
 * @description
 * # mapall
 */
angular.module('gogogoApp')
    .directive('mapall', ['$timeout', '$window', '$filter',function ($timeout, $window, $filter){
      return {
        restrict: 'A',
        replace: false,
        link: function (scope, element, attrs) {

          mapboxgl.accessToken = 'pk.eyJ1IjoidGVvIiwiYSI6IllvZUo1LUkifQ.dirqtn275pAKdnqtLM2HSw';
          var map = new mapboxgl.Map({
              container: 'map',
              style: 'mapbox://styles/mapbox/light-v9',
              //style: 'mapbox://styles/mapbox/satellite-v9',
              center: [4.9000,52.3667],
              minZoom:8,
              maxZoom:17,
              zoom: 13
          });

          map.addControl(new mapboxgl.NavigationControl());

          var update = function(data){

            if(!map.getSource('routes')){
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
                      "line-color":{
                          property: 'emotion',
                          type: 'categorical',
                          stops: [
                              ['1', 'rgba(215, 25, 28,0.25)'],
                              ['2', 'rgba(253, 174, 97,0.25)'],
                              ['3', 'rgba(255, 255, 191,0.25)'],
                              ['4', 'rgba(166, 217, 106,0.25)'],
                              ['5', 'rgba(26, 150, 65,0.25)']]
                      },
                      "line-width": 3
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
                      "line-gap-width":4
                  },
                  "filter": ["==", "chunkid", ""]
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
                    "line-color":{
                        property: 'emotion',
                        type: 'categorical',
                        stops: [
                            ['1', 'rgba(215, 25, 28,1)'],
                            ['2', 'rgba(253, 174, 97,1)'],
                            ['3', 'rgba(255, 255, 191,1)'],
                            ['4', 'rgba(166, 217, 106,1)'],
                            ['5', 'rgba(26, 150, 65,1)']]
                    },
                    "line-width": 4
                  },
                  "filter": ["==", "chunkid", ""]
              });

              var bbox = turf.bbox(data);

              map.fitBounds([[
                    bbox[0],
                    bbox[1]
                ], [
                    bbox[2],
                    bbox[3]
                ]],{padding:100});


            }else{
              map.setLayoutProperty('routes', 'visibility', 'visible');
              map.setLayoutProperty('routes-hover', 'visibility', 'visible');
              map.setLayoutProperty('routes-hover-in', 'visibility', 'visible');
              map.setLayoutProperty('grid', 'visibility', 'none');
              map.setLayoutProperty('grid-hover', 'visibility', 'none');
              map.setLayoutProperty('gridPoi', 'visibility', 'none');
              map.setLayoutProperty('gridPoiLabel', 'visibility', 'none');
              map.setLayoutProperty('gridPoiLine', 'visibility', 'none');

              map.easeTo({pitch:0});
            }

            map.on('mousemove', function (e) {
              if(map.getSource('routes')){
                var features = map.queryRenderedFeatures(e.point, { layers: ['routes'] });
                map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
              }
            });

            map.on('click', function (e) {
              var features = map.queryRenderedFeatures(e.point, { layers: ['routes'] });

              if (features.length) {
                  map.setFilter("routes-hover-in", ["==", "chunkid", features[0].properties.chunkid]);
                  map.setFilter("routes-hover", ["==", "chunkid", features[0].properties.chunkid]);
              } else {
                  map.setFilter("routes-hover-in", ["==", "chunkid", ""]);
                  map.setFilter("routes-hover", ["==", "chunkid", ""]);
                  return;
              }

              var feature = features[0];
              var color;
              switch (feature.properties.emotion) {
                  case '1':
                      color = "#d7191c";
                      break;
                  case '2':
                      color = "#fdae61";
                      break;
                  case '3':
                      color = "#c7c732";
                      break;
                  case '4':
                      color = "#a6d96a";
                      break;
                  case '5':
                      color = "#1a9641";
              }

              var distance = Math.round(turf.lineDistance(feature)*100)/100;
              var date = $filter('date')(feature.properties.startDatetime, "MMM d, y") + ' at ' + $filter('date')(feature.properties.startDatetime, "HH:mm:ss");
              var text = '<span class="popupTitle">' +
                          feature.properties.teamid +
                          '</span><br><span class="popupSubTitle">' +
                          '<span style="color:' + color +';">' + distance + ' km </span>' +
                          'by ' +
                          feature.properties.tm +'<br>on '+
                           date +'</span>';


              var popup = new mapboxgl.Popup()
                  .setLngLat(map.unproject(e.point))
                  .setHTML(text)
                  .addTo(map);
            });

          }

          var updateGrid = function(data){

            var popup = new mapboxgl.Popup({
                  closeButton: false,
                  closeOnClick: false,
                  offset: [10,-10],
                  anchor: 'bottom-left'
              });

            map.setLayoutProperty('routes', 'visibility', 'none');
            map.setLayoutProperty('routes-hover', 'visibility', 'none');
            map.setLayoutProperty('routes-hover-in', 'visibility', 'none');
            if(map.getSource('gridPoi')){
              map.setLayoutProperty('gridPoi', 'visibility', 'none');
              map.setLayoutProperty('gridPoiLabel', 'visibility', 'none');
              map.setLayoutProperty('gridPoiLine', 'visibility', 'none');
            }

            if(!map.getSource('grid')){

              map.addSource("grid", {
                  "type": "geojson",
                  "data": data
              })

              var countExtent = d3.extent(data.features, function(d){
                return d.properties.count;
              })

              var heightScale = d3.scaleLinear()
                  .range([10, 500])
                  .domain(countExtent);

              map.addLayer({
                  "id": "grid",
                  "type": "fill",
                  "source": "grid",
                  "paint": {
                      "fill-opacity": 0.55,
                      "fill-color":{
                          property: 'emotions',
                          type: 'categorical',
                          stops: [
                              ['1', 'rgba(215, 25, 28,1)'],
                              ['2', 'rgba(253, 174, 97,1)'],
                              ['3', 'rgba(255, 255, 191,1)'],
                              ['4', 'rgba(166, 217, 106,1)'],
                              ['5', 'rgba(26, 150, 65,1)']]
                      },
                      "fill-extrude-base":0,
                      "fill-extrude-height":{
                        "stops": [[countExtent[0],10],[countExtent[1],500]],
                        "property": "count",
                        "base": 1
                      }
                  }
              });

              map.addLayer({
                  "id": "grid-hover",
                  "type": "fill",
                  "source": "grid",
                  "paint": {
                      "fill-opacity": 1,
                      "fill-color":{
                          property: 'emotions',
                          type: 'categorical',
                          stops: [
                              ['1', 'rgba(215, 25, 28,1)'],
                              ['2', 'rgba(253, 174, 97,1)'],
                              ['3', 'rgba(255, 255, 191,1)'],
                              ['4', 'rgba(166, 217, 106,1)'],
                              ['5', 'rgba(26, 150, 65,1)']]
                      },
                      "fill-extrude-base":0,
                      "fill-extrude-height":{
                        "stops": [[countExtent[0],10],[countExtent[1],500]],
                        "property": "count",
                        "base": 1
                      }
                  },
                  "filter": ["==", "id", ""]
              });
              var center = turf.centroid(data).geometry.coordinates;
              map.easeTo({pitch:50, center: center});

            }else{
              map.setLayoutProperty('grid', 'visibility', 'visible');
              map.setLayoutProperty('grid-hover', 'visibility', 'visible');
              map.easeTo({pitch:50});
            }

            map.on('mousemove', function (e) {
              var features = map.queryRenderedFeatures(e.point, { layers: ['grid'] });
              if (!features.length) {
                popup.remove();
                map.setFilter("grid-hover", ["==", "id", ""]);
                return;
              }

              map.getCanvas().style.cursor = (features.length) ? 'crosshair' : '';

              var feature = features[0];

              map.setFilter("grid-hover", ["==", "id", feature.properties.id]);

              var emodict = {
                '1':'em-tired_face',
                '2':'em-worried',
                '3':'em-neutral_face',
                '4':'em-blush',
                '5':'em-smile'
              };

              var text = '<span class="popupSubTitle"><b>' +
                          feature.properties.count +'</b> tracked points<br>'+
                          'average emotion: <i class="em ' + emodict[feature.properties.emotions] +'"></i></span>';

              popup.setLngLat(map.unproject(e.point)).setHTML(text).addTo(map);


            })
          }

          var updatePoi = function(data){

            var popup = new mapboxgl.Popup({
                  closeButton: false,
                  closeOnClick: false,
                  offset: [10,-10],
                  anchor: 'bottom-left'
              });

            map.setLayoutProperty('routes', 'visibility', 'none');
            map.setLayoutProperty('routes-hover', 'visibility', 'none');
            map.setLayoutProperty('routes-hover-in', 'visibility', 'none');
            if(map.getSource('grid')){
              map.setLayoutProperty('grid', 'visibility', 'none');
              map.setLayoutProperty('grid-hover', 'visibility', 'none');
            }

            if(!map.getSource('gridPoi')){

              map.addSource("gridPoi", {
                  "type": "geojson",
                  "data": data
              })

              var countExtent = d3.extent(data.features, function(d){
                return d.properties.count;
              })

              var heightScale = d3.scaleLinear()
                  .range([10, 500])
                  .domain(countExtent);

              map.addLayer({
                  "id": "gridPoi",
                  "type": "fill",
                  "source": "gridPoi",
                  "paint": {
                      "fill-opacity": 1,
                      "fill-color":{
                          property: 'emotions',
                          type: 'categorical',
                          stops: [
                              ['1', 'rgba(215, 25, 28,1)'],
                              ['2', 'rgba(253, 174, 97,1)'],
                              ['3', 'rgba(255, 255, 191,1)'],
                              ['4', 'rgba(166, 217, 106,1)'],
                              ['5', 'rgba(26, 150, 65,1)']]
                      },
                      "fill-outline-color":{
                          property: 'category',
                          type: 'categorical',
                          stops: [
                              ['', 'rgba(0,0,0,0)'],
                              ['Café', '#045a8d'],
                              ['Cultureel', '#74a9cf'],
                              ['includeeditGroen', '#810f7c'],
                              ['Horeca', '#636363'],
                              ['Onderwijs', '#993404']]
                      }
                  }
              });

              map.addLayer({
                  "id": "gridPoiLine",
                  "type": "line",
                  "source": "gridPoi",
                  "paint": {
                      "line-width": 3,
                      "line-color":{
                          property: 'category',
                          type: 'categorical',
                          stops: [
                              ['', 'rgba(0,0,0,0)'],
                              ['Café', '#045a8d'],
                              ['Cultureel', '#74a9cf'],
                              ['includeeditGroen', '#810f7c'],
                              ['Horeca', '#636363'],
                              ['Groen', '#c51b8a'],
                              ['Onderwijs', '#993404']]
                      }
                  }
              });

              map.addLayer({
                  "id": "gridPoiLabel",
                  "type": "symbol",
                  "source": "gridPoi",
                  "layout": {
                      "text-field": "{name}",
                      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                      "text-size": 12
                  },
                  "paint":{
                    "text-color": "#fff",
                    "text-halo-color": "#000000",
                    "text-halo-width": 2
                  }
              });

              var center = turf.centroid(data).geometry.coordinates;
              map.easeTo({pitch:0, center: center});

            }else{
              map.setLayoutProperty('gridPoi', 'visibility', 'visible');
              map.setLayoutProperty('gridPoiLabel', 'visibility', 'visible');
              map.setLayoutProperty('gridPoiLine', 'visibility', 'visible');
              map.easeTo({pitch:0});
            }

            map.on('mousemove', function (e) {
              var features = map.queryRenderedFeatures(e.point, { layers: ['gridPoi'] });
              if (!features.length) {
                popup.remove();
                return;
              }

              map.getCanvas().style.cursor = (features.length) ? 'crosshair' : '';

              var feature = features[0];


              var emodict = {
                '1':'em-tired_face',
                '2':'em-worried',
                '3':'em-neutral_face',
                '4':'em-blush',
                '5':'em-smile'
              };

              var text = '<span class="popupSubTitle"><b>' +
                          feature.properties.count +'</b> tracked points<br>'+
                          'Average emotion: <i class="em ' + emodict[feature.properties.emotions] +'"></i><br>'+
                          'Category: <b>' + feature.properties.category + '</b></span>'

              popup.setLngLat(map.unproject(e.point)).setHTML(text).addTo(map);


            })
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

        scope.$watch('reportType', function(newValue, oldValue){
              if(newValue != oldValue && newValue){
                  if(newValue == 'average'){
                    updateGrid(scope.gridFeatures);
                  }else if(newValue == 'all'){
                    update(scope.routes);
                  }else if(newValue == 'poi'){
                    updatePoi(scope.poiGrid);
                  }
              }//end if change
            })

        }
      };
    }]);
