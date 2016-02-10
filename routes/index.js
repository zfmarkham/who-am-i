var express = require('express');
var router = express.Router();
var Question = require('../models/question');
var User = require('../models/user');
var inspect = require('util').inspect;
var Busboy = require('busboy');

var latinise = require('../public/javascripts/latinise.min_.js');

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
     * This is linked to the play/:id route below
     * Not sure how this works but this recognises the id in the play url, and performs it's business on it first
     * Then the next() call means it goes to the next route that matches the url, so in this case the /play/:id route below
     * The req param is maintained to the 'next' route, so in the /play/:id route, req will have questionData available to it
     */
    router.param('id', function(req, res, next, id) {
        Question.findOne({_id: id}, function (err, question) {
            if (err) return next(error);
            if (!question) return next(new Error('Question not found'));
            req.questionData = question;
            next();
        });
    });

    /**
     * Shows question with id that matches url param.
     */
    router.get('/play/:id', isAuthenticated, function (req, res, next) {

        // If question data already exists, pass it to the next handler
        if (req.user.questionData.id(req.questionData._id))
        {
            next();
        }
        else
        {
            // else create default question data then pass to next handler
            req.user.questionData.push({_id: req.questionData._id, attempts: 0, clues: 1});
            req.user.save(function (err) {
                if (!err) {
                    next();
                }
            });
        }

    });

    /**
     * Shows most recent question
     */
    router.get('/play*', isAuthenticated, function (req, res) {

        if (req.questionData)
        {
            res.render('play', {question: req.questionData, userInfo: req.user.questionData.id(req.questionData._id)});
        }
        else
        {
            // Get most recent question and render that
            Question.findOne({}).sort('-_id').exec(function (err, question) {
                res.render('play', {question: question, userInfo: req.user.questionData.id(question._id)});
            });
        }
    });

    /**
     * Archive route, displays question list.
     */
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

            var ref = req.headers.referer.slice(req.headers.referer.lastIndexOf("/"));
            var question = (ref == "/play") ? qdocs[qdocs.length - 1] : qdocs.id(ref);

            var qData = req.user.questionData.id(question._id);
            var facts = question.facts;
            var response = err ? {error: err} : {};

            if (!err && qData.clues < facts.length)
            {
                qData.clues++;
                response = {revealClue: true, clueID: qData.clues};
                req.user.save(function (err) {
                    if (err) console.log("Error saving user attempt");
                })
            }
            else
            {
                response.revealClue = false;
            }

            res.send(response);
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

            Question.find(function(err, qdocs) {
                if (err) return console.log(err);

                var ref = req.headers.referer.slice(req.headers.referer.lastIndexOf("/"));
                var question = (ref == "/play") ? qdocs[qdocs.length - 1] : qdocs.id(ref);

                req.user.questionData.id(question._id).attempts++;

                var response = err ? {error: err} : {};

                if (postdata.guess.latinise().toLowerCase() == question.answer.latinise().toLowerCase())
                {
                    response = {correct: true};
                }
                else
                {
                    response = {correct: false};
                }

                req.user.save(function (err) {
                        if (err) console.log("Error submitting answer");
                    }
                );

                res.send(response);
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