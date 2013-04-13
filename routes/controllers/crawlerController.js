var    	AM = require('../modules/crawlerModule');
var    	aigoDefine = require('../configs/define');
var 	moment = require('moment');
var 	Crawler = require("simplecrawler");

//////////////////--Helper--//////////////////
var parserVideoURL_24H = function(stringURL) {
//  http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000001.mp4,http:/video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000002.mp4&"
	
	var results = {};
	var videoclips = [];
	var stringList = stringURL.split(',');
	for (var i = 0; i < stringList.length; i++) {
		
		//var videoinfo = {};

		var rePattern = new RegExp(/.*videoclip\/(.*)\/(.*).mp4/);
		var arrMatches = stringList[i].match(rePattern);
		console.log("-----",stringList[i]);

		// url
		var url = arrMatches[0];
		console.log("-----",url);

		// data
		var date = arrMatches[1];
		var vname = arrMatches[2];
		
		// clean up name of video 
		//  - remove _vs_
		vname = vname.replace(/_vs_/gi,"_");
		console.log("-----",vname);
		//  - remove _mp4_
		vname = vname.replace(/_mp4_/gi,"_");
		console.log("-----",vname);

		// get first name
		var teamList = vname.split('_');
		var team1 = teamList[0];
		var team2 = teamList[1];
		console.log("-----",team1,team2);

		
		if (i == 0) {
			// build json result
			results.date = date;
			results.team1 = team1;
			results.team2 = team2;
			results.source = '24h.vn';
		}
		videoclips.push(url);
	}

	results.videoclips = videoclips;
	console.log("---------results",results);
	return results;

}

// Crawler.crawl("http://hn.24h.com.vn/video-ban-thang-c297.html")
//     .on("fetchcomplete",function(queueItem){
//         console.log("Completed fetching resource:",queueItem.url);
//     });

exports.crawler_24H = function() {

	var root = "http://hn.24h.com.vn/video-ban-thang-c297.html/";
	//root = "http://hn.24h.com.vn/video-ban-thang/juventus-bayern-san-phang-thanh-turin-c297a534397.html";
	var indexString = "c297";
	var videotype = ".mp4";
	var videomatch = ".mp4&";

	var crawler = Crawler.crawl(root);

	crawler.interval = 1000;
	// crawler.filterByDomain = "c297";
	// crawler.scanSubdomains = true;

	var conditionID = crawler.addFetchCondition(function(parsedURL) {
	    return (parsedURL.path.match(indexString) || parsedURL.path.match(videotype));
	});

	crawler.on("fetchcomplete",function(queueItem,responseBuffer, response){
		//console.log("I just received %s (%d bytes)",queueItem.url,responseBuffer.length);
	    //console.log("It was a resource of type %s",response.headers['content-type']);
	    //console.log("Completed fetching resource:",queueItem.url);
	    //console.log("buffer",responseBuffer)
	});

	var tableDB = 1;
	var now = new Date();
	crawler.on("discoverycomplete",function(queueItem,resources){
		for (var i = resources.length - 1; i >= 0; i--) {
			if (resources[i].match(videomatch)) {
				console.log("--%d-resource: ",i,resources[i]);
				var o = {};
				o = parserVideoURL_24H(resources[i]);
				// save to db
				// AM.insertData(tableDB,o,function(e, o) {
				// });
				var searchKeys = o;
				//searchKeys.videoclips = undefined;
				AM.findByMultipleFields(searchKeys,function(e, o1) {
					if (o1.length == 0) {
						// save to db
						console.log("--------new",e);
						var jsonDate = now.toJSON();
						o.uptime = jsonDate;
						AM.insertData(tableDB,o,function(e, o) {
						});
					} else {
						// AM.insertData(tableDB,o,function(e, o) {
						// });
						console.log("--------already had video info",e,o1);
						// already had video info
					}
				});
			}
		};
	});


	crawler.on("complete",function(){
	    console.log("completed");
	});

}

exports.videosPerDate = function(req, res) {

	console.log('------------videosPerDate start',req.params.date);
	var retdata = {};

	var tableDB = 1;
	
	var searchKeys = {date:req.params.date};
	AM.findByMultipleFields(searchKeys,function(e, o) {
		if (o.length == 0) {
			retdata.msg = e;
			res.send(retdata, 400);
		} else {
			retdata = o;
			retdata.msg = 'ok';
			res.send(retdata, 200);
		}
	});
}

exports.allDates = function(req, res) {

	console.log('------------AllDates start');
	var retdata = {};

	var tableDB = 1;
	
	//var searchKeys = {date:req.params.date};
	AM.findAllDate(function(e, o) {
		if (o.length == 0) {
			retdata.msg = e;
			res.send(retdata, 400);
		} else {
			retdata = o;
			retdata.msg = 'ok';
			res.send(retdata, 200);
		}
	});
}