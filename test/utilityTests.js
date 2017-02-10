const fs = require(`fs`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const proxyquire = require(`proxyquire`);
const package = require('../package.json');
const util = require(`../generators/app/utility`);

const BUILD_API_VERSION = `2.0`;
const PROJECT_API_VERSION = `1.0`;
const RELEASE_API_VERSION = `3.0-preview.3`;
const DISTRIBUTED_TASK_API_VERSION = `3.0-preview.1`;
const SERVICE_ENDPOINTS_API_VERSION = `3.0-preview.1`;

describe(`utility`, () => {  

   it(`addUserAgent`, () => {
      // Arrange
      let options = {
                  method: 'GET',
                  headers: { 'cache-control': 'no-cache', 'authorization': `Basic token` },
                  url: `https://test.visualstudio.com/_apis/projects/test`,
                  qs: { 'api-version': PROJECT_API_VERSION }
               };
      let expected = `Yo Team/${package.version} (${process.platform}: ${process.arch}) Node.js/${process.version}`;

      // Act
      let actual = util.addUserAgent(options);

      // Assert
      assert.equal(expected, actual.headers['user-agent']);
   }); 

   it(`getUserAgent`, () => {
      // Arrange
      let expected = `Yo Team/${package.version} (${process.platform}: ${process.arch}) Node.js/${process.version}`;

      // Act
      let actual = util.getUserAgent();

      // Assert
      assert.equal(expected, actual);
   });

   it(`getPATPrompt should return generic message`, () => {
      // Arrange
      let expected = `What is your Personal Access Token?`;

      // Act
      let actual = util.getPATPrompt({});

      // Assert
      assert.equal(expected, actual);
   });

   it(`getPATPrompt should return TFS message`, () => {
      // Arrange
      let expected = `What is your TFS Personal Access Token?`;

      // Act
      let actual = util.getPATPrompt({ tfs: `http://localhost:8080/tfs/DefaultCollection` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getDefaultPortMapping java`, () => {
      var actual = util.getDefaultPortMapping({ type: `java` });
      assert.equal(`8080:8080`, actual);
   });

   it(`getDefaultPortMapping asp`, () => {
      var actual = util.getDefaultPortMapping({ type: `asp` });
      assert.equal(`80:80`, actual);
   });

   it(`getDefaultPortMapping node`, () => {
      var actual = util.getDefaultPortMapping({ type: `node` });
      assert.equal(`3000:3000`, actual);
   });

   it(`getDefaultPortMapping default`, () => {
      var actual = util.getDefaultPortMapping({ type: `unknown` });
      assert.equal(`80:80`, actual);
   });

   it(`getPools has error`, function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic OnRva2Vu`, options.headers.authorization, `wrong authorization`);
            assert.equal(`http://localhost:8080/tfs/DefaultCollection/_apis/distributedtask/pools`, options.url, `wrong url`);

            // Respond
            callback(`boom`, null, null);
         }
      });

      // Act
      proxyApp.getPools({ tfs: `http://localhost:8080/tfs/DefaultCollection`, pat: `token` }).then(() => {
         assert.fail();
         done();
      }, (e) => {
         assert.equal(`boom`, e);
         done();
      });
   });

   it(`getPools had no error`, function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic OnRva2Vu`, options.headers.authorization, `wrong authorization`);
            assert.equal(`http://localhost:8080/tfs/DefaultCollection/_apis/distributedtask/pools`, options.url, `wrong url`);

            // Respond
            callback(null, null, JSON.stringify({ value: "UnitTest" }));
         }
      });

      // Act
      proxyApp.getPools({ tfs: `http://localhost:8080/tfs/DefaultCollection`, pat: `token` }).then((x) => {
         assert.equal(`UnitTest`, x);
         done();
      }, (e) => {
         assert.fail();
         done();
      });
   });

   it(`validatePortMapping should return true`, () => {
      assert.ok(util.validatePortMapping(`80:80`));
   });

   it(`validatePortMapping should return error`, () => {
      assert.equal(`You must provide a Port Mapping`, util.validatePortMapping(null));
   });

   it(`validateApplicationName should return error`, () => {
      assert.equal(`You must provide a name for your application`, util.validateApplicationName(null));
   });

   it(`validateGroupID should return error`, () => {
      assert.equal(`You must provide a Group ID`, util.validateGroupID(null));
   });

   it(`validatePersonalAccessToken should return error`, () => {
      assert.equal(`You must provide a Personal Access Token`, util.validatePersonalAccessToken(null));
   });

   it(`validateTFS should return error`, () => {
      assert.equal(`You must provide your TFS URL or Team Service account name`, util.validateTFS(null));
   });

   it(`validateAzureSub should return error`, () => {
      assert.equal(`You must provide an Azure Subscription Name`, util.validateAzureSub(null));
   });

   it(`validateDockerHost should return error`, () => {
      assert.equal(`You must provide a Docker Host URL`, util.validateDockerHost(null));
   });

   it(`validateDockerCertificatePath should return error`, () => {
      assert.equal(`You must provide a Docker Certificate Path`, util.validateDockerCertificatePath(null));
   });

   it(`validateDockerHubID should return error`, () => {
      assert.equal(`You must provide a Docker Registry username`, util.validateDockerHubID(null));
   });

   it(`validateDockerHubPassword should return error`, () => {
      assert.equal(`You must provide a Docker Registry Password`, util.validateDockerHubPassword(null));
   });

   it(`validateDockerRegistry should return error`, () => {
      assert.equal(`You must provide a Docker Registry URL`, util.validateDockerRegistry(null));
   });

   it(`validateAzureSubID should return error`, () => {
      assert.equal(`You must provide an Azure Subscription ID`, util.validateAzureSubID(null));
   });

   it(`validateAzureTenantID should return error`, () => {
      assert.equal(`You must provide an Azure Tenant ID`, util.validateAzureTenantID(null));
   });

   it(`validateServicePrincipalID should return error`, () => {
      assert.equal(`You must provide a Service Principal ID`, util.validateServicePrincipalID(null));
   });

   it(`validateServicePrincipalKey should return error`, () => {
      assert.equal(`You must provide a Service Principal Key`, util.validateServicePrincipalKey(null));
   });

   it(`checkStatus should run with no error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic token`, options.headers.authorization, `wrong authorization`);
            assert.equal(`http://localhost:8080/tfs/DefaultCollection/1/_apis/distributedtask/queues`, options.url, `wrong url`);

            // Respond
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ id: 420 }, { id: 311 }] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      // Act
      proxyApp.checkStatus(`http://localhost:8080/tfs/DefaultCollection/1/_apis/distributedtask/queues`, `token`, logger, (e, data) => {
         assert.equal(e, null);

         done();
      });
   }));

   it(`findQueue should find queue`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic token`, options.headers.authorization, `wrong authorization`);
            assert.equal(`http://localhost:8080/tfs/DefaultCollection/1/_apis/distributedtask/queues`, options.url, `wrong url`);

            // Respond
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ id: 420 }, { id: 311 }] }));
         }
      });

      // Act
      proxyApp.findQueue(
         `Hosted`,
         `http://localhost:8080/tfs/DefaultCollection`,
         { id: 1 },
         `token`,
         (err, data) => {
            // Assert
            assert.equal(420, data);

            done();
         });
   }));

   it(`findQueue should returns error obj from server`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 302 }, JSON.stringify("{ error: `some error` }"));
         }
      });

      // Act
      proxyApp.findQueue(
         `Hosted`,
         `http://localhost:8080/tfs/DefaultCollection`,
         { id: 1 },
         `token`,
         (err, data) => {
            // Assert
            assert.ok(err);

            done();
         });
   }));

   it(`findQueue should returns error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 400 }, null);
         }
      });

      // Act
      proxyApp.findQueue(
         `Hosted`,
         `http://localhost:8080/tfs/DefaultCollection`,
         { id: 1 },
         `token`,
         (err, data) => {
            // Assert
            assert.ok(err instanceof Error);

            done();
         });
   }));

   it(`findDockerRegistryServiceEndpoint should short circuit with null or undefined dockerRegistry`, sinon.test(function (done) {
      util.findDockerRegistryServiceEndpoint(null, null, undefined, null, (err, obj) => {
         assert.equal(err, null);
         assert.equal(obj, null);

         done();
      });
   }));

   it(`tryFindDockerRegistryServiceEndpoint should return null`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [] }));
         }
      });

      proxyApp.tryFindDockerRegistryServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `DockerHub`, `token`, (err, obj) => {
            assert.equal(obj, undefined);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindDockerRegistryServiceEndpoint should return endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ type: "dockerregistry" }] }));
         }
      });

      proxyApp.tryFindDockerRegistryServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `DockerHub`, `token`, (err, obj) => {
            assert.equal(obj.type, `dockerregistry`);
            assert.equal(err, null);

            done();
         });
   }));

   it(`findDockerServiceEndpoint should short circuit with null or undefined dockerHost`, sinon.test(function (done) {
      util.findDockerServiceEndpoint(null, null, undefined, null, null, (err, obj) => {
         assert.equal(err, null);
         assert.equal(obj, null);

         done();
      });
   }));

   it(`tryFindDockerServiceEndpoint should return undefined`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindDockerServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `DockerHub`, `token`, logger, (err, obj) => {
            assert.equal(obj, undefined);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindDockerServiceEndpoint should return endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ url: "DockerHub" }] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindDockerServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `DockerHub`, `token`, logger, (err, obj) => {
            assert.equal(obj.url, `DockerHub`);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindDockerServiceEndpoint should return error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 400 }, undefined);
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindDockerServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `DockerHub`, `token`, logger, (err, obj) => {
            assert.ok(err);
            assert.equal(obj, undefined);

            done();
         });
   }));

   it(`tryFindAzureServiceEndpoint should short circuit`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindAzureServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, { name: `` }, `token`, logger, (err, obj) => {
            assert.equal(obj, null);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindAzureServiceEndpoint should return undefined`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindAzureServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, { name: `AzureSub` }, `token`, logger, (err, obj) => {
            assert.equal(obj, undefined);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindAzureServiceEndpoint should return endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ data: { subscriptionName: "AzureSub" } }] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindAzureServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, { name: `AzureSub` }, `token`, logger, (err, obj) => {
            assert.equal(obj.data.subscriptionName, `AzureSub`);
            assert.equal(err, null);

            done();
         });
   }));

   it(`tryFindProject should return project`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: "I`m a project!" }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindProject(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `token`, logger, (err, obj) => {
            assert.equal(err, null);
            assert.equal(obj.value, "I`m a project!");

            done();
         });
   }));

   it(`tryFindProject should return undefined`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 404 }, "{}");
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.tryFindProject(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `token`, logger, (err, obj) => {
            assert.equal(err, null);
            assert.equal(obj, undefined);

            done();
         });
   }));

   it(`FindProject should return error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback("boom", { statusCode: 500 }, "{}");
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      proxyApp.findProject(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `token`, logger, (err, obj) => {
            assert.equal(err, "boom");
            assert.equal(obj, null);

            done();
         });
   }));

   it(`FindProject should return error for auth issue`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 203 }, "{}");
         }
      });

      var logger = this.stub();
      logger.log = () => { };
      logger.log.error = () => { };

      proxyApp.findProject(`http://localhost:8080/tfs/DefaultCollection`,
         `e2eDemo`, `token`, logger, (err, obj) => {
            assert.equal(err.message, "Unable to authenticate with Team Services. Check account name and personal access token.");

            done();
         });
   }));

   it(`tryFindBuild should return build paas`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ name: "e2eDemo-CI" }] }));
         }
      });

      proxyApp.tryFindBuild(`http://localhost:8080/tfs/DefaultCollection`,
         { name: "e2eDemo" }, `token`, "paas", (err, obj) => {
            assert.equal(err, null);
            assert.equal(obj.name, "e2eDemo-CI");

            done();
         });
   }));

   it(`tryFindBuild should return build docker`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ name: "e2eDemo-Docker-CI" }] }));
         }
      });

      proxyApp.tryFindBuild(`http://localhost:8080/tfs/DefaultCollection`,
         { name: "e2eDemo" }, `token`, "docker", (err, obj) => {
            assert.equal(err, null);
            assert.equal(obj.name, "e2eDemo-Docker-CI");

            done();
         });
   }));

   it(`tryFindBuild should return undefined`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 404 }, JSON.stringify({ value: [] }));
         }
      });

      proxyApp.tryFindBuild(`http://localhost:8080/tfs/DefaultCollection`,
         { name: "e2eDemo" }, `token`, "paas", (err, obj) => {
            assert.equal(err, null);
            assert.equal(obj, undefined);

            done();
         });
   }));

   it(`tryFindRelease should return release paas`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ name: "e2eDemo-CD" }] }));
         }
      });

      var args = {
         target: `paas`,
         appName: `e2eDemo`,
         token: `token`,
         account: `http://localhost:8080/tfs/DefaultCollection`,
         teamProject: { name: `e2eDemo` }
      };

      proxyApp.tryFindRelease(args, (err, obj) => {
         assert.equal(err, null);
         assert.equal(obj.name, "e2eDemo-CD");

         done();
      });
   }));

   it(`tryFindRelease should return release docker`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ name: "e2eDemo-Docker-CD" }] }));
         }
      });

      var args = {
         token: `token`,
         target: `docker`,
         appName: `e2eDemo`,
         teamProject: { name: `e2eDemo` },
         account: `http://localhost:8080/tfs/DefaultCollection`
      };

      proxyApp.tryFindRelease(args, (err, obj) => {
         assert.equal(err, null);
         assert.equal(obj.name, "e2eDemo-Docker-CD");

         done();
      });
   }));

   it(`tryFindRelease should return undefined`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            callback(null, { statusCode: 404 }, JSON.stringify({ value: [] }));
         }
      });

      var args = {
         token: `token`,
         target: `paas`,
         appName: `e2eDemo`,
         teamProject: { name: `e2eDemo` },
         account: `http://localhost:8080/tfs/DefaultCollection`
      };

      proxyApp.tryFindRelease(args, (err, obj) => {
         assert.equal(err, null);
         assert.equal(obj, undefined);

         done();
      });
   }));

   it(`validateInstance good`, () => {
      // Arrange
      var expected = true;

      // Act
      var actual = util.validateInstance(`vsts`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`validateInstance is required`, () => {
      // Arrange
      var expected = `You must provide a Team Services account name`;

      // Act
      var actual = util.validateInstance(``);

      // Assert
      assert.equal(expected, actual);
   });

   it(`validateInstance account only`, () => {
      // Arrange
      var expected = `Only provide your account name ({account}.visualstudio.com) not the entire URL. Just the portion before .visualstudio.com.`;

      // Act
      var actual = util.validateInstance(`https://vsts.visualstudio.com`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`isVSTS true`, () => {
      // Arrange
      var expected = false;

      // Act
      var actual = util.isVSTS(`http://tfs:8080/tfs/DefaultCollection`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`isVSTS true`, () => {
      // Arrange
      var expected = true;

      // Act
      var actual = util.isVSTS(`mydemos`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`get full URL for TFS`, () => {
      // Arrange
      var expected = `http://tfs:8080/tfs/DefaultCollection`;

      // Act
      var actual = util.getFullURL(`http://tfs:8080/tfs/DefaultCollection`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`get full URL for VSTS`, () => {
      // Arrange
      var expected = `https://vsts.visualstudio.com`;

      // Act
      var actual = util.getFullURL(`vsts`);

      // Assert
      assert.equal(expected, actual);
   });

   it(`get full URL for VSTS for RM`, () => {
      // Arrange
      var expected = `https://vsts.vsrm.visualstudio.com/DefaultCollection`;

      // Act
      var actual = util.getFullURL(`vsts`, true, true);

      // Assert
      assert.equal(expected, actual);
   });

   it('findAzureSub should find sub', sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire('../generators/app/utility', {
         'request': (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal('GET', options.method, 'wrong method');
            assert.equal('https://vsts.visualstudio.com/_apis/distributedtask/serviceendpointproxy/azurermsubscriptions', options.url, 'wrong url');

            // Respond
            callback(null, { statusCode: 200 }, JSON.stringify({ value: [{ displayName: 'NotMySub' }, { displayName: 'AzureSub' }] }));
         }
      });

      var logger = this.stub();
      logger.log = () => { };

      // Act
      proxyApp.findAzureSub(
         'vsts',
         'AzureSub',
         'token',
         logger,
         (err, data) => {
            // Assert
            assert.equal('AzureSub', data.displayName);

            done();
         });
   }));

   it(`getAzureSubs has error`, function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic OnRva2Vu`, options.headers.authorization, `wrong authorization`);
            assert.equal(`https://vsts.visualstudio.com/_apis/distributedtask/serviceendpointproxy/azurermsubscriptions`, options.url, `wrong url`);

            // Respond
            callback(`boom`, null, null);
         }
      });

      // Act
      proxyApp.getAzureSubs({ tfs: `vsts`, pat: `token` }).then(() => {
         assert.fail();
         done();
      }, (e) => {
         assert.equal(`boom`, e);
         done();
      });
   });

   it(`getAzureSubs had no error`, function (done) {
      // Arrange
      var expected = JSON.stringify([{ name: `One` }, { name: `two` }]);

      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      const proxyApp = proxyquire(`../generators/app/utility`, {
         "request": (options, callback) => {
            // Confirm the request was formatted correctly
            assert.equal(`GET`, options.method, `wrong method`);
            assert.equal(`Basic OnRva2Vu`, options.headers.authorization, `wrong authorization`);
            assert.equal(`https://vsts.visualstudio.com/_apis/distributedtask/serviceendpointproxy/azurermsubscriptions`, options.url, `wrong url`);

            // Respond
            callback(null, null, JSON.stringify({ value: [{ displayName: `One` }, { displayName: `two` }] }));
         }
      });

      // Act
      proxyApp.getAzureSubs({ tfs: `vsts`, pat: `token` }).then((x) => {
         assert.equal(expected, JSON.stringify(x));
         done();
      }, (e) => {
         assert.fail();
         done();
      });
   });
});