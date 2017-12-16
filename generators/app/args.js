const util = require(`./utility`);

function profileCmd(obj) {
   obj.argument(`profileCmd`, {
      required: false,
      desc: `Add, Delete or List`
   });
}

function profileName(obj) {
   obj.argument(`profileName`, {
      required: false,
      desc: `name of the profile to store or load`
   });
}

function tfsVersion(obj) {
   obj.argument(`tfsVersion`, {
      required: false,
      desc: `api version to store in profile`
   });
}

function applicationType(obj) {
   obj.argument(`type`, {
      required: false,
      desc: `project type to create (asp, node, java or custom)`
   });
}

function applicationName(obj) {
   obj.argument(`applicationName`, {
      required: false,
      desc: `name of the application`
   });
}

function customFolder(obj) {
   obj.argument(`customFolder`, {
      required: false,
      desc: `path to folder of build & release templates`
   });
}

function tfs(obj) {
   obj.argument(`tfs`, {
      required: false,
      desc: `full tfs URL including collection or Team Services account name`
   });
}

function azureSub(obj) {
   obj.argument(`azureSub`, {
      required: false,
      desc: `Azure Subscription name`
   });
}

function azureSubId(obj) {
   obj.argument(`azureSubId`, {
      required: false,
      desc: `Azure Subscription ID`
   });
}

function tenantId(obj) {
   obj.argument(`tenantId`, {
      required: false,
      desc: `Azure Tenant ID`
   });
}

function servicePrincipalId(obj) {
   obj.argument(`servicePrincipalId`, {
      required: false,
      desc: `Azure Service Principal Id`
   });
}

function queue(obj) {
   obj.argument(`queue`, {
      required: false,
      desc: `agent queue name to use`
   });
}

function target(obj) {
   obj.argument(`target`, {
      required: false,
      desc: `docker or Azure app service`
   });
}

function installDep(obj) {
   obj.argument(`installDep`, {
      required: false,
      desc: `if true dependencies are installed`
   });
}

function groupId(obj) {
   obj.argument(`groupId`, {
      required: false,
      desc: `groupId of Java project`
   });
}

function dockerHost(obj) {
   obj.argument(`dockerHost`, {
      required: false,
      desc: `Docker host url including port`
   });
}

function dockerCertPath(obj) {
   obj.argument(`dockerCertPath`, {
      required: false,
      desc: `path to Docker certs folder`
   });
}

function dockerRegistry(obj) {
   obj.argument(`dockerRegistry`, {
      required: false,
      desc: `server of your Docker registry`
   });
}

function dockerRegistryId(obj) {
   obj.argument(`dockerRegistryId`, {
      required: false,
      desc: `username for Docker registry`
   });
}

function dockerPorts(obj) {
   obj.argument(`dockerPorts`, {
      required: false,
      desc: `port mapping for container and host`
   });
}

function dockerRegistryPassword(obj) {
   obj.argument(`dockerRegistryPassword`, {
      required: false,
      desc: `password for your Docker registry`
   });
}

function servicePrincipalKey(obj) {
   obj.argument(`servicePrincipalKey`, {
      required: false,
      desc: `Azure Service Principal Key`
   });
}

function pat(obj) {
   obj.argument(`pat`, {
      required: false,
      desc: `Personal Access Token to TFS/VSTS`
   });
}

function gitAction(obj) {
   obj.argument(`action`, {
      required: false,
      desc: `the Git action to take`
   });
}

module.exports = {
   tfs: tfs,
   pat: pat,
   queue: queue,
   target: target,
   groupId: groupId,
   azureSub: azureSub,
   tenantId: tenantId,
   gitAction: gitAction,
   profileCmd: profileCmd,
   profileName: profileName,
   tfsVersion: tfsVersion,
   azureSubId: azureSubId,
   installDep: installDep,
   dockerHost: dockerHost,
   dockerPorts: dockerPorts,
   customFolder: customFolder,
   dockerCertPath: dockerCertPath,
   dockerRegistry: dockerRegistry,
   applicationType: applicationType,
   applicationName: applicationName,
   dockerRegistryId: dockerRegistryId,
   servicePrincipalId: servicePrincipalId,
   servicePrincipalKey: servicePrincipalKey,
   dockerRegistryPassword: dockerRegistryPassword,
};