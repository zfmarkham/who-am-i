var express = require('express');
var router = express.Router();
var Question = require('../models/question');
var User = require('../models/user');
var inspect = require('util').inspect;
var Busboy = require('busboy');

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
};

module.exports = function (passport) {

    /* GET login page. */
    router.get('/', function (req, res) {
        // Display the Login page with any flash message, if any
        res.render('index', {message: req.flash('message')});
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }));

    /* GET Registration Page */
    router.get('/signup', function (req, res) {
        res.render('register', {message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    /* GET Home Page */
    router.get('/home', isAuthenticated, function (req, res) {
        res.render('home');
    });

    /* Handle Logout */
    router.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    /*
     * Handler main play page - show most recent question
     */
    router.get('/play', isAuthenticated, function (req, res) {

        Question.find(function(err, qdocs) {
            if (err) return console.log(err);

            // TODO Need to add current user's Id to this query
            // In here, <"_id": 0> stops the id from being shown in the result
            User.find({}, {questionData: {$elemMatch: {"_id" : qdocs[0]._id}}, "_id": 0}, function (err, users) {
                if (err) return console.log(err);

                res.render('play', {question: qdocs[0], userInfo: users[0].questionData[0]});
            });
        })
    });

    /*
     * Handler play pages reachable through archive, with appended questionId
     */
    router.get('/play/*', isAuthenticated, function (req, res) {

        Question.find(function(err, qdocs) {
            if (err) return console.log(err);

            // TODO Need to add current user's Id to this query
            // In here, <"_id": 0> stops the id from being shown in the result
            User.find({}, {questionData: {$elemMatch: {"_id" : qdocs[0]._id}}, "_id": 0}, function (err, users) {
                if (err) return console.log(err);

                res.render('play', {question: qdocs[0], userInfo: users[0].questionData[0]});
            });
        })
    });

    router.get('/archive', function (req, res) {

        Question.find(function(err, qdocs) {
            res.render('archive', {questions: qdocs});
        })
    });

    /*
     * POST to getClue.
     */
    router.post('/getClue', isAuthenticated, function(req, res) {

        Question.find(function(err, qdocs) {
            if (err) return console.log(err);

            User.findById(req.user._id, function(err, user){

                var questionData = user.questionData.id(qdocs[0]._id);
                var facts = qdocs[0].facts;
                var response = {};

                if (err) {
                    response = {error: err};
                }
                else if (questionData.clues < facts.length)
                {
                    questionData.clues++;
                    response = {revealClue: true, clueID: questionData.clues};
                    user.save(function (err) {
                            if (err) console.log("Error saving user attempt");
                            else console.log("NO ERROR TEST");
                        }
                    );
                }
                else
                {
                    response = {revealClue: false};
                }


                // Handy console.log functionality - util.inspect - use on an object to display it parsed.

                res.send(response);
            });
        })
    });

    /*
     * POST to resetClues - DEV ONLY
     */
    router.post('/resetClues', isAuthenticated, function(req, res) {
        Question.find(function(err, qdocs) {
            if (err) return console.log(err);

            User.findById(req.user._id, function(err, user){

                var questionData = user.questionData.id(qdocs[0]._id);
                var response = (err === null) ? {} : {error: err};

                questionData.clues = 1;
                user.save(function (err) {
                        if (err) console.log("Error resetting clues");
                    }
                );

                res.send(response);
            });
        })
    });

    router.post('/submitGuess', isAuthenticated, function(req, res) {

        var busboy = new Busboy({headers: req.headers});
        var postdata = {};

        busboy.on('field', function(fieldname, val, fieldNameTruncated, valTruncated, encoding, mimetype) {
            postdata[fieldname] = val;
        });

        busboy.on('finish', function() {
            console.log('POSTDATA : ' + inspect(postdata));

            //res.writeHead(303, {Connection: 'close', Location: '/'});
            //res.end();


            postdata.guess;

            Question.find(function(err, qdocs) {
                if (err) return console.log(err);

                User.findById(req.user._id, function(err, user){

                    var questionData = user.questionData.id(qdocs[0]._id);
                    var response = (err === null) ? {} : {error: err};

                    questionData.attempts++;

                    if (postdata.guess.toLowerCase() == qdocs[0].answer.toLowerCase())
                    {
                        response = {correct: true};
                    }
                    else
                    {
                        response = {correct: false};
                    }

                    user.save(function (err) {
                            if (err) console.log("Error submitting answer");
                        }
                    );

                    res.send(response);
                });
            });


            // Don't know the difference between res.writeHead + res.end over just res.send.
            //res.send();
        });
        req.pipe(busboy); // Also don't really know what pipe does
    });

    /* GET Account Page */
    router.get('/account', isAuthenticated, function (req, res) {
        res.render('account', {user: req.user});
    });

    return router;
};