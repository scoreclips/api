var    	AM = require('../modules/crawlerModule');
var    	aigoDefine = require('../configs/define');
var 	moment = require('moment');
var 	Crawler = require("simplecrawler");
var 	request = require('request');

var		bitly_username = 'aigogroup'; 	
var 	bitly_apikey   = 'R_d0a7a46663ae22d76c35c4546bc7f049';


var parse = function (str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

    return str.replace(/%s/g, function() {
        return args[i++];
    });
}

var getShortentUrl_bitly = function(url,callback)
{
	//url = 'http%3A%2F%2Fbetaworks.com%2F';
	var requestUrl = parse('http://api.bitly.com/v3/shorten?login=%s&apiKey=%s&longUrl=%s&format=json',bitly_username,bitly_apikey,url); 
	//console.log(requestUrl);
	request(requestUrl, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			var o = JSON.parse(body);
  			var data = o.data;
  			//console.log(data.url) // Print the google web page.
  			callback(null,data.url);
  		} else {
  			callback(error,undefined);
  		}
	})
	
};


// TESTING
// var url = 'http://hcm.24h.com.vn/bong-da/chelsea-swansea-thang-loi-nhe-nhang-c48a538896.html';
// console.log(url);
// var requestUrl = parse('http://api.bitly.com/v3/shorten?login=%s&apiKey=%s&longUrl=%s&format=json',bitly_username,bitly_apikey,url); 
// 	console.log(requestUrl);
// 	request(requestUrl, function (error, response, body) {
//   		if (!error && response.statusCode == 200) {
//   			var o = JSON.parse(body);
//   			var data = o.data;
//   			console.log(data.url) // Print the google web page.
//   			callback(null,body);
//   		} else {
//   			console.log(error);
//   		}
//   	});
// getShortentUrl_bitly(url,function(e, o1) {
// 	console.log(o1)
// });





//// NOTE MAY BE USED RSS: http://www.24h.com.vn/upload/rss/videobanthang.rss

//////////////////--Helper--//////////////////
var cleanHTMLString = function(inputString) {
//  http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000001.mp4,http:/video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000002.mp4&"
	
	var result = inputString;
	
	result = result.replace(/\&amp;/gi,"\&");
	result = result.replace(/\&quot;/gi,"\"");
	result = result.replace(/\&quot;/gi,"\"");


	return result;
}

// var test = cleanHTMLString("Bayern - Wolfsburg: Nuôi mộng &quot;ăn 3&quot;");
// console.log("--------",test);

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


var parserVideoHTML_24H = function(stringHTML) {
//  http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000001.mp4,http:/video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-10/Dortmund_Malaga_Mp4_0000000000000000000002.mp4&"
	

	var results = {};
	results.source = '24h.vn';
	var videoclips = [];
	var stringList = stringHTML.split('\n');

	//console.log("---------stringHTML=",stringHTML);

	for (var i = 0; i < stringList.length; i++) {
		
		//var videoinfo = {};
		
		///title
		// http://hcm.24h.com.vn/bong-da/newcastle-benfica-quyet-tam-cao-do-c48a534673.html
		// <meta content="Newcastle – Benfica: Quyết tâm cao độ" itemprop="headline"/> 
		// <meta content="Furth – Dortmund: Cảnh báo Mourinho" itemprop="headline"/> 
		var rePattern = new RegExp(/.*<meta content=\"(.*)\" itemprop="headline"\/>/);
		
		// or 
		//<h1 class="baiviet-title"> Newcastle – Benfica: Quyết tâm cao độ			</h1>
		var rePattern_v0826 = new RegExp(/.*baiviet-title.*\s*\>\s*(.*)<\/h1>/);
		
		// or 
		// <meta content="Ro vẩu lốp bóng top 10 bàn thắng đẹp tuần" itemprop="headline"/> 
		
		var line = cleanHTMLString(stringList[i]);
		var arrMatches = line.match(rePattern);

		if (arrMatches == null) {
			arrMatches = line.match(rePattern_v0826);
		}

		
		if (arrMatches != null) {
			console.log("------rePattern_v0826",arrMatches);
			var matchedString = arrMatches[1];
			// get team1 team2 
			rePattern = new RegExp(/(.*):\s*(.*)/);
			var arrTeamMatches = matchedString.match(rePattern);

			if (arrTeamMatches != null) {
				
				results.teams = cleanHTMLString(arrTeamMatches[1]);
				results.desciptions = arrTeamMatches[2];

				rePattern = new RegExp(/(.*)\s[-,–]\s(.*)/);
				arrTeamMatches = results.teams.match(rePattern);
				if (arrTeamMatches != null) {
					results.team1 = cleanHTMLString(arrTeamMatches[1]);
					results.team2 = cleanHTMLString(arrTeamMatches[2]);
				}
				  
				
			} else {
				results.teams = arrMatches[1].replace(/amp;/gi,"");
			}
			console.log("-----get team1 team2:",line);

		} else {

			// clips
			//flashWrite("/js/player24H2.swf?cID=297&file=http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_01.mp4,http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_02.mp4,http://video-hn.24hstatic.com/upload/2-2013/videoclip/2013-04-13/Arsenal_vs_Norwich_03.mp4&",500,447, "/", "http://anh.24h.com.vn/upload/2-2012/images/2012-05-21/24h_bongda_527x298.swf", "/");
			//24/11/2013 - flashWrite("?cID=48&region=HCM&static_domain=http://stream08.24h.com.vn:8008/&file=http://stream08.24h.com.vn:8008/upload/2-2013/videoclip/2013-04-12/Newcastle_Vs_Benfica_001.mp4,http://stream08.24h.com.vn:8008/upload/2-2013/videoclip/2013-04-12/Newcastle_Vs_Benfica_002.mp4&",418,314, '/', 'http://stream08.24h.com.vn:8008/upload/4-2013/images/2013-11-22/1385089347-24hbong.swf', 'http://stream08.24h.com.vn:8008/upload/4-2013/images/2013-11-07/1383810427-thaiminh.flv');
			// url
			rePattern = new RegExp(/.*flashWrite\(.*file=(.*)/);
			arrMatches = line.match(rePattern);

			if (arrMatches != null) {

				var clipList = arrMatches[1].split(',');
				for (var clipIndex = 0; clipIndex < clipList.length; clipIndex++) {
					
					// Get Date from video clip
					rePattern = new RegExp(/(http.*videoclip\/(.*)\/(.*).mp4).*/);
					arrMatches = clipList[clipIndex].match(rePattern);

					if (arrMatches != null) {
						videoclips.push(arrMatches[1]);
						results.date = arrMatches[2];
					}
					console.log("-----clips:",clipList[clipIndex]);
				}
			}
			else {
				// scores
				// case 1: <p><strong>Tỉ số</strong>: Newcastle - Benfica 1-1 (Chung cuộc: Newcastle – Benfica 2-4, <strong>Benfica là đội giành quyền vào bán kết)</strong></p>
				// 			<p><strong>Ghi bàn: Cisse 71' - Salvio 92'</strong></p>
				// case 2: <p><strong>Chung cuộc:</strong>&#160;Troyes 0-1 PSG</p>
				// case 3: Tỷ số 1-6<br />
				// case 4: Chung cuộc: 3-2 (tổng tỷ số 4-5 sau 2 lượt trận, Chelsea giành quyền vào bán kết)
				// case 5: Kết quả 0-2
				rePattern = new RegExp(/.*Tỉ số(.*\d+\s*-\s*\d+.*)/);
				arrMatches = line.match(rePattern);

				var case1_3_5 = 0;
				if (arrMatches != null) {
					// case 1:
					case1_3_5 = 1;
					console.log("---score case1--",arrMatches[1]);
				} else {
					// case 3:
					rePattern = new RegExp(/.*Tỷ số(.*\d+\s*-\s*\d+.*)/);
					arrMatches = line.match(rePattern);
					if (arrMatches != null) {
						case1_3_5 = 3;
						console.log("---score case3--",arrMatches[1]);
					} else {
						// case 5
						rePattern = new RegExp(/.*Kết quả:(.*\d+\s*-\s*\d+.*)/);
						arrMatches = line.match(rePattern);
						if (arrMatches != null) {
							case1_3_5 = 5;
							console.log("---score case5--",arrMatches[1]);
						} 
					}
				}

				if (case1_3_5 !=  0) {
					matchedString = arrMatches[1];
					rePattern = new RegExp(/(\d+\s*-\s*\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (results.score == null) {
						if (arrTeamMatches != null) {
							results.score = arrTeamMatches[1].replace(/ /gi,"");
						} else {
							results.score = matchedString.replace(/ /gi,"");
						}
					}
				}

				// case 1+2:
				rePattern = new RegExp(/.*Chung cuộc(.*\d+\s*-\s*\d+.*)/);
				arrMatches = line.match(rePattern);
				if (arrMatches != null) {
					matchedString = arrMatches[1];
					rePattern = new RegExp(/(\d+\s*-\s*\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (arrTeamMatches != null) {
						results.finalscore = arrTeamMatches[1].replace(/ /gi,"");
					} else {
						//results.finalscore = matchedString;
					}
					console.log("---score case1-2--",matchedString);
				}

				// case 4:
				rePattern = new RegExp(/.*tổng tỷ số(.*\d+\s*-\s*\d+.*)/);
				arrMatches = line.match(rePattern);
				if (arrMatches != null) {
					matchedString = arrMatches[1];
					rePattern = new RegExp(/(\d+\s*-\s*\d+)/);
					arrTeamMatches = matchedString.match(rePattern);

					if (arrTeamMatches != null) {
						if (results.finalscore != null) {
							results.score = results.finalscore.replace(/ /gi,"");
						}
						results.finalscore = arrTeamMatches[1].replace(/ /gi,"");

					} else {
						//results.finalscore = matchedString;
					}
					console.log("---score case1-2--",matchedString);
				}

			}
		}
		//console.log("------line ",i,line);

	}


	console.log("-------result1111:",results);
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

	var checkedIndex = [];
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
		    var searchKeys = {};
		    //searchKeys.sourceURL = o.sourceURL;
		    searchKeys.teams = o.teams;
		    searchKeys.date = o.date;
			//searchKeys.videoclips = undefined;
			AM.findByMultipleFields(searchKeys,function(e, o1) {
				if (o1.length == 0) {
					var url = o.sourceURL;
					// get shortent url from bitly
					getShortentUrl_bitly(url,function(e, shortenUrl) {
						console.log('---sourceURL= ' + url + 'shorten url = ' + shortenUrl);
						if (e) {
							// do nothing
						} else {
							o.sourceURL = shortenUrl;
						}

						// check url exit
						var boolCheck = checkedIndex.indexOf(o.sourceURL);
						if (boolCheck == -1) {
							checkedIndex.push(o.sourceURL);	
							// save to db
							console.log("--------new",o1,checkedIndex);
							var jsonDate = now.toJSON();
							o.uptime = jsonDate;
							AM.insertData(tableDB,o,function(e, o2) {
							});
						}
					});
					
				} else {
					// already had video info
					// update video list
					// o1.videoclips = o.videoclips;
					// o1.score = o.score;
					// o1.finalscore = o.finalscore;
					// o1.date = o.date;
					// o1.desciptions = o.desciptions;
					// o1.teams = o.teams;
					// o1.team1 = o.team1;
					// o1.team2 = o.team2;
					// console.log("c-updating",e,o,o1);
					// AM.saveData(tableDB,o1,function(e, o2) {
					// });
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
