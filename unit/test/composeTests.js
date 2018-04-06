const fs = require(`fs`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const proxyquire = require(`proxyquire`);
const package = require('../../package.json');
const sinonTestFactory = require(`sinon-test`);
const compose = require(`../../generators/app/compose`);

const sinonTest = sinonTestFactory(sinon);

describe(`compose`, function () {
   context(`addLanguage`, function () {
      it(`node`, sinonTest(function () {
         let called = false;
         let target = {
            type: `node`,
            applicationName: `nodeTest`,
            installDep: `false`,
            dockerPorts: `3000:3000`,
            composeWith: function () {
               called = true;
               assert.equal(arguments.length, 2, `call to composeWith has wrong number of arguments`);
               assert.equal(arguments[0], `team:node`, `wrong generator`);
               assert.equal(arguments[1].arguments.length, 3, `object has wrong number of properties`);
               assert.equal(arguments[1].arguments[0], `nodeTest`, `object has wrong applicationName`);
               assert.equal(arguments[1].arguments[1], `false`, `object has wrong installDep`);
               assert.equal(arguments[1].arguments[2], `3000:3000`, `object has wrong dockerPorts`);
            }
         };

         compose.addLanguage(target);

         assert.equal(called, true);
      }));

      it(`asp`, sinonTest(function () {
         let called = false;
         let target = {
            type: `asp`,
            applicationName: `aspTest`,
            installDep: `true`,
            dockerPorts: `80:80`,
            composeWith: function () {
               called = true;
               assert.equal(arguments.length, 2, `call to composeWith has wrong number of arguments`);
               assert.equal(arguments[0], `team:asp`, `wrong generator`);
               assert.equal(arguments[1].arguments.length, 3, `object has wrong number of properties`);
               assert.equal(arguments[1].arguments[0], `aspTest`, `object has wrong applicationName`);
               assert.equal(arguments[1].arguments[1], `true`, `object has wrong installDep`);
               assert.equal(arguments[1].arguments[2], `80:80`, `object has wrong dockerPorts`);
            }
         };

         compose.addLanguage(target);

         assert.equal(called, true);
      }));

      it(`aspFull`, sinonTest(function () {
         let called = false;
         let target = {
            type: `aspFull`,
            applicationName: `aspFullTest`,
            installDep: `true`,
            dockerPorts: `80:80`,
            composeWith: function () {
               called = true;
               assert.equal(arguments.length, 2, `call to composeWith has wrong number of arguments`);
               assert.equal(arguments[0], `team:aspFull`, `wrong generator`);
               assert.equal(arguments[1].arguments.length, 1, `object has wrong number of properties`);
               assert.equal(arguments[1].arguments[0], `aspFullTest`, `object has wrong applicationName`);
            }
         };

         compose.addLanguage(target);

         assert.equal(called, true);
      }));

      it(`java`, sinonTest(function () {
         let called = false;
         let target = {
            type: `java`,
            applicationName: `javaTest`,
            installDep: `true`,
            dockerPorts: `8080:8080`,
            groupId: `unitTests`,
            composeWith: function () {
               called = true;
               assert.equal(arguments.length, 2, `call to composeWith has wrong number of arguments`);
               assert.equal(arguments[0], `team:java`, `wrong generator`);
               assert.equal(arguments[1].arguments.length, 4, `object has wrong number of properties`);
               assert.equal(arguments[1].arguments[0], `javaTest`, `object has wrong applicationName`);
               assert.equal(arguments[1].arguments[1], `unitTests`, `object has wrong groupId`);
               assert.equal(arguments[1].arguments[2], `true`, `object has wrong installDep`);
               assert.equal(arguments[1].arguments[3], `8080:8080`, `object has wrong dockerPorts`);
            }
         };

         compose.addLanguage(target);

         assert.equal(called, true);
      }));



   });
});