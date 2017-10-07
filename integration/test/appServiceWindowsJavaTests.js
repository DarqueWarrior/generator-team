const appService = require('./appService');

describe(`Default Java AS`, function () {
   describe(`Azure App Service (Windows) using Default queue`, function () {
      "use strict";
      var iterations = [{
         appType: `java`,
         appName: `javaPaaSTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         groupId: `unitTest`,
         suffix: ``,
         queue: `Default`,
         title: `Home Page - My Spring Application`
      }];

      iterations.forEach(appService.runTests);
   });
});