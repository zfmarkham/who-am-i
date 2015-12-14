var express = require('express');
var router = express.Router();

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

    /* Get WhoAmI */
    router.get('/play', isAuthenticated, function (req, res) {
        /*var db = req.db;
         var collection = db.get('facts');
         collection.find({}, {}, function (e, docs) {
         res.render('whoami', {
         "facts": docs
         });
         });*/

        var Question = require('../models/question');
        Question.find(function (err, docs) {
            res.render('play', {question: docs[0]});
        });

    });

    /* GET Account Page */
    router.get('/account', isAuthenticated, function (req, res) {
        res.render('account', {user: req.user});
    });

    return router;
};





