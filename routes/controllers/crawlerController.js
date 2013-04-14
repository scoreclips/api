var    	AM = require('../modules/crawlerModule');
var    	aigoDefine = require('../configs/define');
var 	moment = require('moment');
var 	Crawler = require("simplecrawler");



//// NOTE MAY BE USED RSS: http://www.24h.com.vn/upload/rss/videobanthang.rss



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
		//console.log("-----",stringList[i]);

		// url
		var url = arrMatches[0];
		//console.log("-----",url);

		// data
		var date = arrMatches[1];
		var vname = arrMatches[2];
		
		// clean up name of video 
		//  - remove _vs_
		vname = vname.replace(/_vs_/gi,"_");
		//console.log("-----",vname);
		//  - remove _mp4_
		vname = vname.replace(/_mp4_/gi,"_");
		//console.log("-----",vname);

		// get first name
		var teamList = vname.split('_');
		var team1 = teamList[0];
		var team2 = teamList[1];
		//console.log("-----",team1,team2);

		
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

var parserVideoHTML_24H = function(stringHTML) {
//  http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000001.mp4,http:/video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000002.mp4&"
	

	var results = {};
	results.source = '24h.vn';
	var videoclips = [];
	var stringList = stringHTML.split('\n');
	for (var i = 0; i < stringList.length; i++) {
		
		//var videoinfo = {};
		
		///title
		// http://hcm.24h.com.vn/bong-da/newcastle-benfica-quyet-tam-cao-do-c48a534673.html
		// <meta content="Newcastle – Benfica: Quyết tâm cao độ" itemprop="headline"/> 
		// <meta content="Furth – Dortmund: Cảnh báo Mourinho" itemprop="headline"/> 

		// or 
		// <meta content="Ro vẩu lốp bóng top 10 bàn thắng đẹp tuần" itemprop="headline"/> 
		var rePattern = new RegExp(/.*<meta content=\"(.*)\" itemprop="headline"\/>/);
		var arrMatches = stringList[i].match(rePattern);

		if (arrMatches != null) {
			var matchedString = arrMatches[1];
			// get team1 team2 
			rePattern = new RegExp(/(.*):\s*(.*)/);
			var arrTeamMatches = matchedString.match(rePattern);

			if (arrTeamMatches != null) {
				
				results.teams = arrTeamMatches[1];
				results.desciptions = arrTeamMatches[2];

				rePattern = new RegExp(/(.*)\s[-,–]\s(.*)/);
				arrTeamMatches = results.teams.match(rePattern);
				if (arrTeamMatches != null) {
					results.team1 = arrTeamMatches[1];
					results.team2 = arrTeamMatches[2];
				}
				  
				
			} else {
				results.teams = arrMatches[1];
			}
			console.log("-----",stringList[i]);

		} else {

			// clips
			//flashWrite("/js/player24H2.swf?cID=297&file=http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_01.mp4,http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_02.mp4,http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_03.mp4&",500,447, "/", "http://anh.24h.com.vn/upload/2-2012/images/2012-05-21/24h_bongda_527x298.swf", "/");
			// url
			rePattern = new RegExp(/.*flashWrite\(\"\/js\/player24H2.swf\?cID=297\&file=(.*)/);
			arrMatches = stringList[i].match(rePattern);

			if (arrMatches != null) {

				var clipList = arrMatches[1].split(',');
				for (var clipIndex = 0; clipIndex < clipList.length; clipIndex++) {
					
					rePattern = new RegExp(/(http.*videoclip\/(.*)\/(.*).mp4).*/);
					arrMatches = clipList[clipIndex].match(rePattern);

					if (arrMatches != null) {
						videoclips.push(arrMatches[1]);
						results.date = arrMatches[2];
					}
					console.log("-----",clipList[clipIndex]);
				}
			}
			else {
				// scores
				// case 1: <p><strong>Tỉ số</strong>: Newcastle - Benfica 1-1 (Chung cuộc: Newcastle – Benfica 2-4, <strong>Benfica là đội giành quyền vào bán kết)</strong></p>
				// 			<p><strong>Ghi bàn: Cisse 71' - Salvio 92'</strong></p>
				// case 2: <p><strong>Chung cuộc:</strong>&#160;Troyes 0-1 PSG</p>
				// case 3: Tỷ số 1-6<br />
				// case 4: Chung cuộc: 3-2 (tổng tỷ số 4-5 sau 2 lượt trận, Chelsea giành quyền vào bán kết)
				rePattern = new RegExp(/.*Tỉ số(.*)/);
				arrMatches = stringList[i].match(rePattern);

				if (arrMatches != null) {
					// case 1:
					matchedString = arrMatches[1];
					// get team1 team2 
					rePattern = new RegExp(/(\d+-\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (arrTeamMatches != null) {
						results.score = arrTeamMatches[1];
					} else {
						results.score = matchedString;
					}
					console.log("---score case1--",matchedString);
				} else {
					// case 3:
					rePattern = new RegExp(/.*Tỷ số(.*)/);
					arrMatches = stringList[i].match(rePattern);
					if (arrMatches != null) {
						matchedString = arrMatches[1];
						// get team1 team2 
						rePattern = new RegExp(/(\d+-\d+)/);
						arrTeamMatches = matchedString.match(rePattern);

						if (arrTeamMatches != null) {
							results.score = arrTeamMatches[1];
						} else {
							results.score = matchedString;
						}
						console.log("---score case3--",matchedString);
					}
				}
				// case 1+2:
				rePattern = new RegExp(/.*Chung cuộc(.*)/);
				arrMatches = stringList[i].match(rePattern);
				if (arrMatches != null) {
					matchedString = arrMatches[1];
					// get team1 team2 
					rePattern = new RegExp(/(\d+-\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (arrTeamMatches != null) {
						results.finalscore = arrTeamMatches[1];
					} else {
						results.finalscore = matchedString;
					}
					console.log("---score case1-2--",matchedString);
				}

				// case 4:
				rePattern = new RegExp(/.*tổng tỷ số(.*)/);
				arrMatches = stringList[i].match(rePattern);
				if (arrMatches != null) {
					matchedString = arrMatches[1];
					// get team1 team2 
					rePattern = new RegExp(/(\d+-\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (arrTeamMatches != null) {
						if (results.finalscore != null) {
							results.core = results.finalscore;
						}
						results.finalscore = arrTeamMatches[1];

					} else {
						results.finalscore = matchedString;
					}
					console.log("---score case1-2--",matchedString);
				}

			}
		}
		//console.log("------line ",i,stringList[i]);

	}


	//console.log("-------result1111:",results);
	if (videoclips.length > 0) {
		results.videoclips = videoclips;
		//console.log("-------parserVideoHTML_24H--results:",results);
		return results;
	} else {
		return null;
	}
	

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

	var tableDB = 1;
	var now = new Date();
	crawler.on("fetchcomplete",function(queueItem,responseBuffer, response){

		var o = {};
		//console.log("I just received %s (%d bytes)",queueItem.url,responseBuffer.length);
	    //console.log("It was a resource of type %s",response.headers['content-type']);
	    console.log("Completed fetching resource:",queueItem.url);
	    var resourceText = responseBuffer.toString("utf8")
	    //console.log("buffer",resourceText);
	    o = parserVideoHTML_24H(resourceText);
	    if (queueItem.url != null && o != null) {
	    	o.sourceURL = queueItem.url;
	    }
	    console.log ("output----",o);

	    if (o != null) {
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

	});

	// Depcricated - based on video path
	// crawler.on("discoverycomplete",function(queueItem,resources){
	// 	for (var i = resources.length - 1; i >= 0; i--) {
	// 		if (resources[i].match(videomatch)) {
	// 			console.log("--%d-resource: ",i,resources[i]);
	// 			var o = {};
	// 			o = parserVideoURL_24H(resources[i]);
	// 			// save to db
	// 			// AM.insertData(tableDB,o,function(e, o) {
	// 			// });
	// 			var searchKeys = o;
	// 			//searchKeys.videoclips = undefined;
	// 			AM.findByMultipleFields(searchKeys,function(e, o1) {
	// 				if (o1.length == 0) {
	// 					// save to db
	// 					console.log("--------new",e);
	// 					var jsonDate = now.toJSON();
	// 					o.uptime = jsonDate;
	// 					AM.insertData(tableDB,o,function(e, o) {
	// 					});
	// 				} else {
	// 					// AM.insertData(tableDB,o,function(e, o) {
	// 					// });
	// 					console.log("--------already had video info",e,o1);
	// 					// already had video info
	// 				}
	// 			});
	// 		}
	// 	};
	// });


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
