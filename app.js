var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
    bodyParser = require('body-parser');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    app.get('/', function(req, res, next) {
        res.render('movieLogger');
    });

    app.get('/movies', function(req, res){

        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies', { 'movies': docs } );
        });

    });
    // Handler for internal server errors
    function errorHandler(err, req, res, next) {
        console.error(err.message);
        console.error(err.stack);
        res.status(500).render('error_template', { error: err });
    }

    app.post('/movie_entry', function(req, res, next) {
        var movie = {
            "title": req.body.title,
            "year": req.body.year,
            "imdb": req.body.imdb
        };
        if (typeof movie == 'undefined') {
            next('Please enter a movie!');
        }
        else {
            db.collection('movies').insertOne({"title": movie.title,
                "year": movie.year, "imdb": movie.imdb});
            db.close();
        }
    });

    app.use(errorHandler);

    app.use(function(req, res){
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});




