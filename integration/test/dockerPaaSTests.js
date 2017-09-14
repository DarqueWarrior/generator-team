const docker = require('./docker');


describe(`Azure Container Instances (Linux) using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   }, {
      appType: `asp`,
      appName: `aspACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   }, {
      appType: `java`,
      appName: `javaACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   }];

   iterations.forEach(docker.runTests);
});

if (util.isVSTS(tfs)) {
   describe(`Azure Container Instances (Linux) using Hosted Linux Preview queue`, function () {
      "use strict";
      var iterations = [{
         appType: `node`,
         appName: `nodeACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: ` `,
         title: `Home Page - My Express Application`
      }, {
         appType: `asp`,
         appName: `aspACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: ` `,
         title: `Home Page - My .NET Core Application`
      }, {
         appType: `java`,
         appName: `javaACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: `integrationTest`,
         title: `Home Page - My Spring Application`
      }];

      iterations.forEach(runTests);
   });
}

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

   iterations.forEach(runTests);
});

