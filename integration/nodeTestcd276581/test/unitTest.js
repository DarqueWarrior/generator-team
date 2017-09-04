const sinon = require('sinon');
const assert = require('assert');
const request = require('supertest');
const target = require('../src/server');

describe('unitTest', function () {
   'use strict';

   it('index should return 200', function (done) {

      request(target)        // Arrange         
         .get('/')           // Act
         .expect(200, done); // Assert

   });

   it('about should return 200', function (done) {

      request(target)        // Arrange         
         .get('/about')      // Act
         .expect(200, done); // Assert

   });

   it('contact should return 200', function (done) {

      request(target)        // Arrange         
         .get('/contact')    // Act
         .expect(200, done); // Assert

   });
});