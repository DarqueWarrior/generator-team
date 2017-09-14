const appService = require('./appService');

describe(`Azure App Service Docker (Linux) using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeDockerPaaSTest`,
      target: `dockerpaas`,
      context: `Azure App Service Docker (Linux)`,
      suffix: `-Docker`,
      queue: `Default`,
      title: `Home Page - My Express Application`
   }, {
      appType: `asp`,
      appName: `aspDockerPaaSTest`,
      target: `dockerpaas`,
      context: `Azure App Service Docker (Linux)`,
      suffix: `-Docker`,
      queue: `Default`,
      title: `Home Page - My .NET Core Application`
   }, {
      appType: `java`,
      appName: `javaDockerPaaSTest`,
      target: `dockerpaas`,
      context: `Azure App Service Docker (Linux)`,
      groupId: `unitTest`,
      suffix: `-Docker`,
      queue: `Default`,
      title: `Home Page - My Spring Application`
   }];

   iterations.forEach(appService.runTests);
});