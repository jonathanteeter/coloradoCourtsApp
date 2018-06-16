var db = require("../models");
const bcrypt = require("bcrypt-nodejs");

// set up according to https://scotch.io/tutorials/easy-node-authentication-setup-and-local

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
var Vendor = require('../models/Vendor');

// expose this function to our app using module.exports
module.exports = function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        console.log('serializeUser');
        console.log("The user is " + JSON.stringify(user));     
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser');
        console.log("The id is" + JSON.stringify(id))
        db.Vendor.findById(id.id).then( (err, user) => {
            done(err, user); 
        })
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) {
            console.log('Inside passport callback');
            // asynchronous
            // Vendor.findOne wont fire unless data is sent back
           process.nextTick(function () {
                console.log('Inside process callback');
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                db.Vendor.findOne({
                    where: {
                        email: email
                    }
                }).then((err, vendor) => {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    console.log('Inside if block that checks for errors');
                    // check to see if theres already a user with that email
                    if (vendor) {
                        console.log('Inside if block that checks to see if user exists');
                        return done(null, false, {
                            message: "This email already exists"
                        });
                    } else {
                        console.log('Inside else block that creates the use if no user exits');

                        // Encrypt the password 
                        var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

                        // Create the vendor if one does not already exist w/ that email
                        db.Vendor.create({
                            email: email,
                            password: hash
                        }).then( (Vendor) => {
                            console.log("Vendor is" +  JSON.stringify(Vendor))
                            // ******This is the f*&ckery is located******
                            // ******This is the f*&ckery is located******
                            return done(null, Vendor);  
                            // ******This is the f*&ckery is located******
                            // ******This is the f*&ckery is located******
                        });
                    }
                });
            });
        }));

    passport.use('local-login', new LocalStrategy(
        // Our user will sign in using an email, rather than a "username"
        {
            usernameField: 'email'
        },
        function (email, password, done) {
            console.log('>>>>>>>>>>>>>>>>>>>');
            console.log('email', email);
            console.log('password', password);
            console.log('>>>>>>>>>>>>>>>>>>>');
            // When a user tries to sign in this code runs
            Vendor.findOne({
                where: {
                    email
                }
            }).then((vendor) => {
                // If there's no user with the given email
                if (!vendor) {
                    return done(null, false, {
                        message: "Incorrect email."
                    });
                }
                // If there is a user with the given email, but the password the user gives us is incorrect
                else if (!vendor.validPassword(password)) {
                    return done(null, false, {
                        message: "Incorrect password."
                    });
                }
                console.log("This code is being executed")
        
                // If none of the above, return the user
                // ******This is the f*&ckery is located******
                // ******This is the f*&ckery is located******
                return done(null, vendor);
                // ******This is the f*&ckery is located******
                // ******This is the f*&ckery is located******
            });
        }
    ));

    console.log('created new local strategy');
};