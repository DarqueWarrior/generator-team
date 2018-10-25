const path = require('path');
const express = require('express');
const utils = require('../src/utility');

// We'll use this to override require calls in routes
const proxyquire = require('proxyquire');

// This will create stubbed functions for our overrides
const sinon = require('sinon');
const sinonTestFactory = require(`sinon-test`);
const sinonTest = sinonTestFactory(sinon);

// Supertest allows us to make requests against an express object
const supertest = require('supertest');

describe('homeController', function () {
   'use strict';

   var app, initAppInsightsStub, request, route;

   beforeEach(function () {
      // A stub we can use to control conditionals
      // Mock AppInsights
      initAppInsightsStub = sinon.stub(utils, 'initAppInsights').returns({
         trackNodeHttpRequest: function () { },
         trackEvent: function () { }
      });

      // Create an express application object
      app = express();

      // view engine setup
      app.set('views', path.join(__dirname, '../src/views'));
      app.set('view engine', 'pug');

      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      route = proxyquire('../src/routes/homeController.js', {
         '../utility': {
            initAppInsights: initAppInsightsStub
         }
      });

      // Bind a route to our application
      route(app);

      // Get a supertest instance so we can make requests
      request = supertest(app);
   });

   it('index should return 200', sinonTest(function (done) {
      request                // Arrange
         .get('/')           // Act
         .expect(200, done); // Assert
   }));

   it('about should return 200', sinonTest(function (done) {

      request                // Arrange
         .get('/about')      // Act
         .expect(200, done); // Assert

   }));

   it('contact should return 200', sinonTest(function (done) {

      request                // Arrange
         .get('/contact')    // Act
         .expect(200, done); // Assert

   }));

   this.afterEach(function () {
      utils.initAppInsights.restore();
   });
});