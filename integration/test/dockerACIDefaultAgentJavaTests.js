const docker = require('./_docker');

describe(`Azure Container Instances (Linux) using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `java`,
      appName: `javaACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   });
});