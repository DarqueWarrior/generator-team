# Kubernetes sub-generator

The k8s sub-generator generates the template files needed to deploy a web application into Kubernetes using helm.

#### Table of Contents
1. [Installing](#installing)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#gettingStarted)

## Installing <a name="installing"></a>

Please refer to the [home](https://github.com/DarqueWarrior/generator-team) repository to install the Yeoman generator.

## Prerequisites <a name="prerequisites"></a>

Along with an Azure Subscription and a Azure DevOps Project, a few things have to be provisioned before running the generator:

1. A Kubernetes Cluster in [Azure Kubernetes Services](https://azure.microsoft.com/en-us/services/kubernetes-service/) (AKS)

2. An [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/) (ACR)

3. A [Service Principal](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-aks?toc=%2fazure%2faks%2ftoc.json) in Azure allowing your Kubernetes Cluster and your ACR to communicate

   - If an Azure account is not configured with the CLI, run the following and follow the prompts:

      ```AzureCli
      az login
      ```

   - The service principal can now be created by running the following:

      ```AzureCli
      #!/bin/bash

      ACR_NAME=<my-acr-instance>
      SERVICE_PRINCIPAL_NAME=<acr-service-principal>

      # Populate the ACR login server and resource id.
      ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
      ACR_REGISTRY_ID=$(az acr show --name $ACR_NAME --query id --output tsv)

      # Create a contributor role assignment with a scope of the ACR resource.
      SP_PASSWD=$(az ad sp create-for-rbac --name $SERVICE_PRINCIPAL_NAME --role Reader --scopes $ACR_REGISTRY_ID --query password --output tsv)

      # Get the service principle client id.
      CLIENT_ID=$(az ad sp show --id http://$SERVICE_PRINCIPAL_NAME --query appId --output tsv)

      # Output used when creating Kubernetes secret.
      echo "Service principal ID: $CLIENT_ID"
      echo "Service principal password: $SP_PASSWD"
      ```

4. The K8s Image Pull Secret

   - To configure Kubectl to talk to the cluster:

      | K8s Service | Install | Get Credentials |
      | --- | --- | --- |
      | AKS | `az aks install-cli` | `az aks get-credentials --name=<myClusterName> --resource-group=<myResourceGroup>` |
      | ACS |  | `az acs kubernetes get-credentials --name=<myClusterName> --resource-group=<myResourceGroup>` |

   - To create the pull secret, run:

      ```AzureCli
      # Create image pull secret
      MY_PULL_SECRET=<acr-auth>

      kubectl create secret docker-registry $MY_PULL_SECRET --docker-server $ACR_LOGIN_SERVER --docker-username $CLIENT_ID --docker-password $SP_PASSWD --docker-email <email-address>
      ```

5. A VSTS [personal access token](https://docs.microsoft.com/en-us/vsts/organizations/accounts/use-personal-access-tokens-to-authenticate?view=vsts) (PAT)

## Getting Started <a name="gettingStarted"></a>

To start type

   ```PowerShell
   yo team
   ```