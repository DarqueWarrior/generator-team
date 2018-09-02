var express = require('express');
var utils = require('../utility');

// application insights
let client = utils.initAppInsights();
let key = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;

module.exports = function (app) {
   var router = express.Router();

   /* GET home page. */
   router.get('/', function (req, res) {
      client.trackNodeHttpRequest({ request: req, response: res });
      client.trackEvent({ name: "Get Index", properties: { customProperty: "route is /" } });
      res.render('index', { title: 'Home Page', instrumentationKey: key });
   });

   router.get('/contact', function (req, res) {
      client.trackEvent({ name: "Get Contact", properties: { customProperty: "route is /contact" } });
      res.render('contact', { title: 'Contact', message: 'Your contact page.', instrumentationKey: key });
   });

   router.get('/about', function (req, res) {
      client.trackEvent({ name: "Get About", properties: { customProperty: "route is /about" } });
      res.render('about', { title: 'About', message: 'Your application description page.', instrumentationKey: key });
   });

   // Mount route as "/"
   app.use('/', router);
};