var express = require('express');
var utils = require('../utility');

// application insights
let client = utils.initAppInsights();
let key = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

module.exports = function (app) {
   var router = express.Router();

   /* GET home page. */
   router.get('/', function (req, res) {
      res.render('index', { title: 'Home Page', instrumentationKey: key });
   });

   router.get('/contact', function (req, res) {
      res.render('contact', { title: 'Contact', message: 'Your contact page.', instrumentationKey: key });
   });

   router.get('/about', function (req, res) {
      res.render('about', { title: 'About', message: 'Your application description page.', instrumentationKey: key });
   });

   // Mount route as "/"
   app.use('/', router);
};