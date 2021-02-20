# generator-team (Yo Team)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DarqueWarrior/generator-team/blob/master/LICENSE)
[![npm - generator-team](https://img.shields.io/badge/npm-generator--team-blue.svg)](https://www.npmjs.com/package/generator-team)

## Build status

[![Build badge](https://loecda.visualstudio.com/_apis/public/build/definitions/4ead775f-7f7b-4f57-9c97-80f30a6d7fbf/10/badge)](https://loecda.visualstudio.com/Yo%20Team/_build/index?context=mine&path=%5C&definitionId=10&_a=completed) 

## See it in action

[Ignite New Zealand 2016](https://channel9.msdn.com/Events/Ignite/New-Zealand-2016/M328?WT.mc_id=devops-0000-dbrown)

## Capabilities

generator-team is a [Yeoman](http://yeoman.io/) generator that creates a complete CI/CD pipeline in [Team Foundation Server](https://www.visualstudio.com/downloads/?WT.mc_id=devops-0000-dbrown) or [Visual Studio Team Services](https://www.visualstudio.com/tfs-test/?WT.mc_id=devops-0000-dbrown) for the following languages:

- Java using Tiles and bootstrap
- Node using Pug and bootstrap
- ASP.net Core using Razor and bootstrap
- ASP.net Full Framework using Razor and bootstrap

It allows you to deploy to the following platforms:

- [Azure App Service](https://azure.microsoft.com/services/app-service/web/?WT.mc_id=devops-0000-dbrown)
- [Docker](https://www.docker.com/) to private host
- [Docker](https://www.docker.com/) images in [Azure App Service on Linux](https://docs.microsoft.com/azure/app-service-web/app-service-linux-intro?WT.mc_id=devops-0000-dbrown)
- [Azure Container Instances](https://docs.microsoft.com/azure/container-instances/?WT.mc_id=devops-0000-dbrown)

## Requirements

- [Team Foundation Server 2017](https://www.visualstudio.com/downloads/?WT.mc_id=devops-0000-dbrown) or [Visual Studio Team Services Account](https://app.vsaex.visualstudio.com/profile/account?WT.mc_id=devops-0000-dbrown)
  - [Personal Access Token](https://www.visualstudio.com/docs/setup-admin/team-services/use-personal-access-tokens-to-authenticate?WT.mc_id=devops-0000-dbrown)
  - Install [Docker Integration](https://marketplace.visualstudio.com/items?itemName=ms-vscs-rm.docker&WT.mc_id=devops-0000-dbrown) on tfs Account
- [Azure Subscription](https://azure.microsoft.com/free/?WT.mc_id=devops-0000-dbrown)
  - [Service Principal](http://donovanbrown.com/post/Creating-an-Azure-Resource-Manager-Service-Endpoint-in-new-Portal)
- [Node.js](http://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bower](https://bower.io/)
- [Azure PowerShell](https://azure.microsoft.com/downloads/?WT.mc_id=devops-0000-dbrown)
- [Git](http://git-scm.org/)
- [.NET Core SDK](http://dot.net)
- [.NET Framework 3.5](https://www.microsoft.com/download/details.aspx?id=21&WT.mc_id=devops-0000-dbrown)
- [Maven](http://maven.apache.org/)
- [Java JDK & JRE](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
- [Docker Toolbox](https://github.com/docker/toolbox/releases)

## Install

`npm install yo`

`npm install generator-team`


## Usage 

Yo team is written in such a manner that it will prompt you for variables it needs if they were not passed as paramaters.
Interactive usage: `yo team`, this wil run all the yo team functionality in interactive mode.
 
The team generator uses smaller generators to do the brunt work

If you want to use yo team in a more fine grained way, you can discover the underlying generators using the `yo --generators` command the output typically looks like

 ```
 > yo --generators
Available Generators:

  team
    asp
    aspFull
    azure
    build
    docker
    feed
    git
    java
    k8s
    node
    nuget
    pipeline
    powershell
    profile
    project
    registry
    release
 ```

If you want use yo team from the commandline, you can discover the parameters that are needed to call a subgenerator by using -h e.g.: `yo team:project -h`

IMPORTANT: the organization name (-tfs parameter) must be the namepart of the organization as used in the url (i.e. dev.azure.com/**ORGANIZATION**/) not the full URL!

For example: if you only want to create a project in Azure DevOps you can call

`yo team:project --applicationName $projectName --tfs $organizationName --pat $azureDevOpsPersonalAccessToken`

If you want to add a pipeline to the create project, you can use

`yo team:pipeline --applicationName $projectName --tfs $organizationName --pat $azureDevOpsPersonalAccessToken --type $appType --queue $agentQueue --target $deployTarget --azureSubId $azureSubscriptionId --servicePrincipalId $servicePrincipleID --servicePrincipalKey $servicePrincipalKey --azureSub $azureSubscriptionName --tenantId $azureAdTenantId`

The `-appType` parameter describes the kind of App you want to create (it's also the name of a generator):
* aspFull, .Net Core application
* java, Java application
* powershell, Powershell module
* etc.


Another source for how to use yo team is at: [DonovanBrown.com](http://donovanbrown.com/post/yo-Team).

## To test

`npm test`

## Debug

You can debug the generator using [VS Code](https://code.visualstudio.com/?WT.mc_id=devops-0000-dbrown). You need to update the launch.json. Replace any value in [] with your information.  Use [npm link](https://docs.npmjs.com/cli/link) from the root folder to load your local version.

## Revision history

## October 2018

### 0.4.10

Supports K8s

## August 2018

### 0.4.9

Does not require Docker Host when Hosted Ubuntu Agent is selected.

Node sub generator changes

- Wires up Application Insights
- Switched to Yarn
- All packages were updated
- Home controller implements IoC to ease testing

### 0.4.8

Merge [Pull Request](https://github.com/DarqueWarrior/generator-team/pull/27) from [Maxime Eglem](https://github.com/MaximeEglem) which included the following:

- Removes usage of deprecated Buffer

### 0.4.7

Support for PowerShell Modules using Package Management and PowerShell Gallery. This is only supported on VSTS at this time. The build will run on hosted macOS, Linux and Windows agents. The release will run on selected agent during prompts.

### 0.4.6

Merge [Pull Request](https://github.com/DarqueWarrior/generator-team/pull/23) from [Joseph Van Wagner](https://github.com/joe45sp) which included the following:

- Updated VSTS .net Core task to 2.*.

Set skipindexing to true in .net builds.

## April 2018

### 0.4.5

Updated code to find profile by name for VSTS even if the profile name does not match the VSTS account name.

Got all tests passing on macOS, Linux and Windows.

## March 2018

### 0.4.4

Updated all the dependencies.
Dropped support for TFS 2017 Update 2. Only update 3.1 is supported.

## December 2017

### 0.4.1

Added support to read profiles from [VSTeam](https://www.powershellgallery.com/packages/VSTeam/) Module. Only profiles of type Pat are supported. If you enter a profile name of type OnPremise you will still be prompted for a Pat.

Added Profile sub generator to Add, List and Delete profiles.

## November 2017

### 0.3.8

Upgraded .NET Core to 2.0.

## October 2017

### 0.3.7-6

Now Supports Deployment slots with App Service.

## September 2017

### 0.3.6

Now supports [Azure Container Instances](https://docs.microsoft.com/azure/container-instances/?WT.mc_id=devops-0000-dbrown).  You can read how to find the public IP in my blog post [Yo Team, meet Azure Container Instances](http://www.donovanbrown.com/post/Yo-Team-meet-Azure-Container-Instances).

## July 2017

### 0.3.5

Merge [Pull Request](https://github.com/DarqueWarrior/generator-team/pull/7) from [Daniel Meixner](https://github.com/DanielMeixner) which included the following:

- Install specific version of .NET Core for ASP.NET Core

### 0.3.4

Fixed bug in Java Docker Build

### 0.3.3

Fixed spelling error

## June 2017

### 0.3.1

Fixed dependencies so users do not need Mocha installed.

### 0.3.0

.NET Core

- Migrated .net core to csproj and updated all references.
- The Hosted build pool is no longer supported for the .NET Core project. The upgrade to csproj is not supported on Hosted. Use HostedVS2017, Hosted Linux or private agent.
- Removed Code coverage from .NET Core because solution was not cross-platform. It only worked on Windows agents.

Node.js

- Fixed issue with Node.js code coverage.

Java, Node.js & .NET Core

- Adding support for running [Docker images in Azure App Service](https://docs.microsoft.com/azure/app-service-web/app-service-linux-using-custom-docker-image?WT.mc_id=devops-0000-dbrown). Working with Product team to see why images initial load takes so long.

Release Defs

- Updated task versions
- The following task were not updated due to breaking changes:
- Azure Resource Group Deployment
- Azure App Service Deploy

General

- Updated generator npm dependencies.

## March 2017

### 0.2.5

Updated the Azure Resource Manager Service Endpoints to work with the Azure Portal Continuous Delivery feature.
Fixed bug in Azure sub generator that asked for information not needed when using VSTS.

### 0.2.4

Fixed some issues with TFS after locking versions for VSTS. Some of the build templates were used for both and locking versions caused issues on TFS.

### 0.2.3

Added Full .NET Framework support but only for Azure App Service.

### 0.2.2

Locked Tasks to specific version. This will prevent auto updates from breaking builds and releases.

Changed release template for PaaS to include Web Performance Test.

Changed release to default to latest version of build for manual releases.

Changed ARM templates to add unique string after Website Name.  This will help make sure final website URL is globally unique.

ASP sub generator only supports .net core 1.0 RC2. RC 3 and above switched to CSPROJ.  yo Team uses hosted agents as lowest common denominator and we will update as soon as CSPROJ is supported on hosted agents.

## February 2017

### 0.2.1

Fixed a bug in the App Service deployment after adding ACR support.

### 0.2.0

Has breaking changes from previous version.  Removed the email parameter for Docker Registries and added support for Azure Container Registry.  Now you can use [Docker Hub](https://hub.docker.com/) or [Azure Container Registry](https://azure.microsoft.com/services/container-registry/?WT.mc_id=devops-0000-dbrown).

## January 2017

### 0.1.3

Improved build names from just build id to build definition name plus build id

### 0.1.2

Added User-Agent Header to request so calls could be identified by VSTS Team telemetry.

### 0.1.0

Initial release
