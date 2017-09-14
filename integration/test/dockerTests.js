const docker = require('./docker');

describe(`Docker Host using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   }, {
      appType: `asp`,
      appName: `aspDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   }, {
      appType: `java`,
      appName: `javaDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   }];

   iterations.forEach(docker.runTests);
});