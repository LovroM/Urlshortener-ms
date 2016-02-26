var express = require('express');
var app = express();
var path = require("path");
var mongo = require("mongodb").MongoClient;
var mongoUrl = "mongodb://localhost:27017/links"


/**************** Display homepage ******************/
app.get('/', function(req, res) {
    res.sendfile(path.join(__dirname, '/client', '/index.html'));
});


app.get(/new\/(.+)/, function(req, res) {

    var new_id = req.params[0];

    console.log("requested: " + new_id);

    var responseObj = {};

    if (/(https?:\/\/\w+\.\w+.+)/.test(new_id)) {


        mongo.connect(mongoUrl, function(error, db) {
            if (error) console.log("failed to connect to db. Error: " + error);

            db.collection("links").find(
            {
                "original_url": new_id
            }).toArray(function(error, urlObj) 
            {
                if (error) console.log(error);
                
                console.log(urlObj[0]);
                
                if (urlObj[0] == undefined)
                {
                    //create new,  db.links.find().count()
                }
                else
                {
                    responseObj = 
                    {
                        "original_url": new_id , "short_url": "heroku/" + urlObj[0].short_url
                    };
   
                    res.send(responseObj);
                }
            })

        })


    }
    else {
        responseObj = 
        {
            "error": "URL invalid"
        };
        res.send(responseObj);
    }

    //var responseObj = { "original_url": "https://www.google.com", "short_url": 1 };
    //res.end();
    //res.send(responseObj);
});

/**************** Short url redirect ****************/
app.get(/(\d+)/, function(req, res) {
    var short_id = req.params[0];
    
    console.log("short_id: " + short_id);
    
    mongo.connect(mongoUrl, function(error, db) 
    {
        if (error) console.log("failed to connect to db. Error: " + error);

        db.collection("links").find(
        {
            "short_url": Number(short_id)
        }).toArray(function(error, urlObj) 
        {
            if (error) console.log(error);
            
            console.log(urlObj[0]);
            
            if (urlObj[0] == undefined)
            {
                res.end({"error":"No short url found for given input"});
                db.close();
            }
            else
            {
                res.writeHead(301, {Location: urlObj[0].original_url} );
                res.end();
                db.close();
            }
        });
    });
        
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});