
/*
 * GET home page.
 */
 var polyline = require('polyline');
 var ObjectId = require('mongodb').ObjectID;

function gps_distance(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}

exports.datainputapp = function(db) {
    return function(req, res) {

		try{
			var collection = db.get('routes');
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'X-Requested-With');
			var pointsList = [];
			data = req.body;
			total_km = 0.00;
			for(i = 0; i < data.route.length; i++){
				pointsList.push([data.route[i].coordinates.latitude,data.route[i].coordinates.longitude])
				//toevoegen elk punt aan array
				if(i == (data.route.length - 1)){
					//voeg laatste punt nog toe (+1)
					break;
				}
				
				total_km += gps_distance(data.route[i].coordinates.latitude, data.route[i].coordinates.longitude, data.route[i+1].coordinates.latitude, data.route[i+1].coordinates.longitude);
			}
			teamidname = data['teamid'];
			startDatetime = data.route[0].timestamp;
			endDatetime = data.route[data.route.length-1].timestamp;
			var encodedLine = polyline.encode(pointsList)

			routelength = data.route.length;
			total_km_rounded = total_km.toFixed(2);
			data['lineString'] = encodedLine;
			data['startDatetime'] = parseInt(startDatetime);
			data['endDatetime'] = parseInt(endDatetime);
			//Encode linestring
			/*if(isNaN(teamidname) == true){
				res.json({success: false});
			}*/
			if(routelength <= 3){
				console.log(routelength);
				res.json({success: false});
			}
			else if(total_km_rounded <= 0.05){
				res.json({success: false});
			}
			else{
				data['distance_inkm'] = total_km_rounded;
				collection.insert(data);
				res.json({success: true});
				
			}
			
		} catch (e) {
			console.log(e);
		}

	};
};

exports.getfulldataapp = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('cleanestRoutes');
		collection.find({},function(e,docs){
			console.log('hier');
			res.json(docs);
		});
	}
};

exports.getdataapp = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('cleanestRoutes');
		var startTime = req.query.startTime;
		var endTime = req.query.endTime;
		var category = req.query.category;
		if(category && startTime && endTime){
				collection.find({'transport_method': category, 'startDatetime': {$gte:parseInt(startTime)}, 'endDatetime':{$lte:parseInt(endTime)}},'-route',function(e,docs){
					res.json(docs);
				});
			}
			else if(category && !startTime && !endTime){
				collection.find({'transport_method': category},'-route',function(e,docs){
					res.json(docs);
				});
			}
			else if(!category && startTime && endTime){
				collection.find({'startDatetime': {$gte:parseInt(startTime)}, 'endDatetime':{$lte:parseInt(endTime)}},'-route',function(e,docs){
					res.json(docs);
				});
			}

			else if(!category && !endTime && !startTime){
				collection.find({},'-route',function(e,docs){
					res.json(docs);
				});
			}
			else{
				res.json({success: false});
			}
    };
};
exports.getdataapp_byid = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('cleanestRoutes');
		var id = req.params.id;
		var startTime = req.query.startTime;
		var endTime = req.query.endTime;
		var category = req.query.category;

	
		if(category && startTime && endTime){
			collection.find({'teamid': id, 'transport_method': category, 'startDatetime': {$gte:parseInt(startTime)}, 'endDatetime':{$lte:parseInt(endTime)}},function(e,docs){
				res.json(docs);
			});
		}
		else if(category && !startTime && !endTime){
			collection.find({'teamid': id, 'transport_method': category},function(e,docs){
				res.json(docs);
			});
		}
		else if(!category && startTime && endTime){
			collection.find({'teamid': id, 'startDatetime': {$gte:parseInt(startTime)}, 'endDatetime':{$lte:parseInt(endTime)}},function(e,docs){
				res.json(docs);
			});
		}

		else if(!category && !endTime && !startTime){
			collection.find({'teamid': id},function(e,docs){
				res.json(docs);
			});
		}
		else{
			res.json({success: false});
		}
		
		
    };
};

exports.getdataapp_byteamandid = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('cleanestRoutes');
		var teamid = req.params.id;
		var routeid = ObjectId(req.params.routeid);


		collection.find({_id: routeid},function(e,docs){
			res.json(docs);
		});
		
    };
};

exports.getlastdata = function(db) {
    return function(req, res) {
		current_time = new Date();
		console.log(current_time);
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('routes');
		var count = req.params.count;
        collection.find({},{'limit':parseInt(count),'sort' :{ '$natural' : -1 }},function(e,docs){
            res.json(docs);
        });
    };
};

exports.getdatacount_byid = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('routes');
		var id = req.params.id;
	
		collection.count({'teamid': id},function(e,count){
			res.json({'count':count});
		});
		
	}
}

exports.getranking = function(db) {
    return function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		var collection = db.get('ranking');
        collection.find({},'-_id',function(e,docs){
			returnObject = {'ranking':docs};
            res.json(returnObject);
        });
    };
};

exports.getdata = function(db) {
    return function(req, res) {
		var collection = db.get('all_locations');
	
		start_time = new Date(req.query.start_date);
		end_time = new Date(req.query.end_date);

        collection.find({'properties.time':{'$gt':start_time, '$lt': end_time}},'-_id',function(e,docs){
			docs2 = {'type': 'FeatureCollection', 'features': docs}
            res.json(docs2);
        });
    };
};

