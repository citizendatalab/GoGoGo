
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var logger = require('morgan');
var http = require('http');
var path = require('path');

var mongo = require('mongodb');
var monk = require('monk');
var bodyParser = require('body-parser');
var db = monk('localhost:27017/sim_locaties');

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.set('json spaces',0)

var router = express.Router();

app.use('/', router);

router.post('/appdata', routes.datainputapp(db));
router.get('/getfulldataapp', routes.getfulldataapp(db));
router.get('/getdataapp', routes.getdataapp(db));
router.get('/getdataapp/:id', routes.getdataapp_byid(db));
router.get('/getdataapp/:id/:routeid', routes.getdataapp_byteamandid(db));
router.get('/getdatacount/:id', routes.getdatacount_byid(db));
router.get('/getranking2', routes.getranking(db));
router.get('/getlastdata/:count', routes.getlastdata(db));

router.get('/map', routes.map);
router.get('/getdata', routes.getdata(db));




// Handle 404
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
  
// Handle 500
app.use(function(error, req, res, next) {
	res.status(404).send('500: Internal Server Error');
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
