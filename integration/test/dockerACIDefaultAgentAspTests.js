const docker = require('./docker');

describe(`Azure Container Instances (Linux) using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `asp`,
      appName: `aspACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   });
});