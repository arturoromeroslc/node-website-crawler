var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var async = require('async');
var fields = ['field1', 'field2', 'field3'];
var app = express();

app.get('/scrape', function(req, response) {

    var arr = [];

    var q = async.queue(function(task, callback) {
        request(task.url, function(error, response, html) {
            var json = {};

            if (error) return callback(error);
            if (response.statusCode != 200) return callback(response.statusCode);

            var $ = cheerio.load(html);

            json.url = task.url.replace('http://tiresjacksonohio.local/', '');
            json.currentMemUsed = $($('.current-mem-use').find("p")[0]).text().replace(/[^0-9]+/, '');
            json.peakMemUsed = $($('.peak-mem-use').find("p")[0]).text().replace(/[^0-9]+/, '');
            json.requestTime = $($('.request-time').find("p")[0]).text().replace(/[^0-9]+/, '');


            sqlLogsPerPage = [];

            var me = $('.sql-log-panel-query-log');
            me = $(me[0]).find('table')[0]

            $(me).find('tr').each(function(i, el) {
                if (i === 0) {
                    return;
                }
                eachRowObject = {};
                $(this).find('td').each(function(i, e) {

                    if (i === 0) {
                        eachRowObject.number = $(e).text();
                    }
                    if (i === 1) {
                        eachRowObject.query = $(e).text();
                    }
                    if (i === 3) {
                        eachRowObject.errors = $(e).text();
                    }
                    if (i === 4) {
                        eachRowObject.affected = $(e).text();
                    }
                    if (i === 5) {
                        eachRowObject.numberOfRows = $(e).text();
                    }
                    if (i === 6) {
                        eachRowObject.milliSecondsTook = $(e).text();
                    }
                    // console.log(sqlLogsPerPage);
                })
                sqlLogsPerPage.push(eachRowObject);
            })

            json.sqlLogs = sqlLogsPerPage;
            arr.push(json);

            callback();
        });
    }, 5);

    var website = 'http://tiresjacksonohio.local/';

    q.push([{
            url: website
        }, {
            url: website + 'catalog/tires'
        }, {
            url: website + 'dynamic_pages/site_map'
        }, {
            url: website + 'tires-auto-repair-jackson-oh'
        }, {
            url: website + 'tires'
        }, {
            url: website + 'services'
        }, {
            url: website + 'services#tire'
        }, {
            url: website + 'catalog/schedule_appointment'
        }, {
            url: website + 'promotions'
        }, {
            url: website + 'about_us'
        }, {
            url: website + 'goodyear-tsn'
        }, {
            url: website + 'blog'
        }, {
            url: website + 'tsn-legal'
        }, {
            url: website + 'reviews'
        }, {
            url: website + 'employment'
        }, {
            url: website + 'pages/contact_us'
        }, {
            url: website + 'battery-replacement-jackson-oh'
        }, {
            url: website + 'brake-service-jackson-oh'
        }, {
            url: website + 'automotive-tune-up-jackson-oh'
        }, {
            url: website + 'transmission-service-jackson-oh'
        }, {
            url: website + 'air-filter-replacement-jackson-oh'
        }, {
            url: website + 'oil-change-service-jackson-oh'
        }, {
            url: website + 'engine-repair-jackson-oh'
        }, {
            url: website + 'suspension-repair-jackson-oh'
        }, {
            url: website + 'windshield-wiper-blades-jackson-oh'
        }, {
            url: website + 'belt-hose-replacement-jackson-oh'
        }, {
            url: website + 'driveline-repair-jackson-oh'
        }, {
            url: website + 'promotions/goodyear-tire-rebates'
        },

    ], function(err) {
        console.log('finished processing url');
    });


    //a callback that is called when the last item from the queue has returned from the worker
    q.drain = function() {
        fs.writeFile('output.json', JSON.stringify(arr, null, 4), function(err) {
            console.log('File successfully written! - Check your project directory for the output.json file');
        });
    };

    //Send out a message to the browser reminding you that this app does not have a UI.
    response.send('Check your console!');

});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;