self.importScripts("https://npmcdn.com/@turf/turf@3.5.1/turf.min.js");

self.onmessage = function (oEvent) {
  var input = oEvent.data.input;
  var grid = oEvent.data.grid;
  var ptFC = [];
  input.forEach(function(route){
    route.route.forEach(function(point){
      ptFC.push(turf.point([+point.coordinates.longitude, +point.coordinates.latitude], {emotion: point.coordinates.emotion}));
    })
  })
  ptFC = turf.featureCollection(ptFC);

  var out = turf.collect(grid, ptFC, 'emotion', 'emotions');

  self.postMessage(out);
};
