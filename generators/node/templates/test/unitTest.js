const sinon = require('sinon');
const assert = require('assert');
const request = require('supertest');
const target = require('../src/server');
const sinonTestFactory = require(`sinon-test`);
const utils = require('../src/utility');
const sinonTest = sinonTestFactory(sinon);

describe('unitTest', function () {
   'use strict';

   // Mock AppInsights
   sinon.stub(utils, 'initAppInsights').returns({
      trackNodeHttpRequest: function () { },
      trackEvent: function () { }
   });

   const target = require('../src/server');

   it('index should return 200', sinonTest(function (done) {

      request(target)        // Arrange         
         .get('/')           // Act
         .expect(200, done); // Assert

   }));

   it('about should return 200', sinonTest(function (done) {

      request(target)        // Arrange         
         .get('/about')      // Act
         .expect(200, done); // Assert

   }));

   it('contact should return 200', sinonTest(function (done) {

      request(target)        // Arrange         
         .get('/contact')    // Act
         .expect(200, done); // Assert

   }));

   this.afterAll(function () {
      utils.initAppInsights.restore();
   });
});