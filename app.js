var express = require('express'),
    //account = require('./routes/account');
    //account = require('./routes/controllers/accountController');
    crawler = require('./routes/controllers/crawlerController');
    //var sleep = require('sleep');

var app = express.createServer();
//var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(require('connect').bodyParser());
});

// get list of videos per date
app.get('/score/videos/:date', crawler.videosPerDate);

// get list of date
app.get('/score/dates', crawler.allDates);

// start crawler 24H manual
app.get('/crawler/24h', crawler.crawler_24H);

app.listen(process.env.PORT || process.env.VCAP_APP_PORT || 3001, function(){
	//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	console.log('Listening on port 3001...');
});

//console.log("Waiting for connect db.....");

//sleep.sleep(10);

var periodtime = 1*60*60*1000;

setInterval(function() {
					crawler.crawler_24H();
                }, periodtime );


var http = require('http')
  , url = require('url');
 
function request(address, path) {
    http.get({ host: address, path: path,port:80}, function(response) {
        // The page has moved make new request
        if (response.statusCode === 301) {
            var newLocation = url.parse(response.headers.location).host;
            console.log('We have to make new request ' + newLocation);
            request(newLocation);
        } else {
            console.log("Response: %d", response.statusCode);
            response.on('data', function(chunk) {
                console.log('Body ' + chunk);
            });
        }
    }).on('error', function(err) {
        console.log('Error %s', err.message);
    });
}
 
//request('www.google.com', '/search?ie=UTF-8&q=node');

//request('24h.com.vn','/video-ban-thang-c297.html');

//request('hn.24h.com.vn','/video-ban-thang/arsenal-norwich-danh-chiem-top-3-c297a535205.html');

//app.listen(process.env.PORT || process.env.VCAP_APP_PORT || 3001);
//console.log('Listening on port 3001...');