# Clean up by removing the project and the folder created on disk
function _cleanUp {
   param($name)

   Get-Project | Where-Object {$_.Name -eq $name} | Remove-Project -Force
   Remove-Item -Recurse -Force -Path $name
}

Describe 'Node_PaaS' {
   
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)

   Context 'Default Agent' {
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default paas false " " " " " " " " " " " " " " " " $env:PAT *> .\testresults\nodePaaS.log
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CI"} | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CD"} | Should not be $Null
      }

      It 'Should create azure serivce endpoint' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'PM_DonovanBrown'}  | Should not be $Null
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll {
         # Clean up by removing the project and the folder created on disk
         _cleanUp -name $projectName
      }
   }
}

Describe 'Node_Docker' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)
      
   Context 'Default Agent' {
      
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default docker false " " "tcp://my2016dockerhost.westus.cloudapp.azure.com:2376" ".\test" "https://index.docker.io/v1/" "unittest" "3000:3000" "unittests" " " $env:PAT *> .\testresults\nodeDocker.log
      
      It 'Should create project' {
         # I can't use Get-Project -Name because Name if validated against existing 
         # projects. If the project was not created an exception will be thrown and
         # confuse the test output.  By returning them all and use Where-Object to
         # locate the one I am looking for the test will fail without throwning the
         # validation exception.
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-Docker-CI"} | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-Docker-CD"} | Should not be $Null
      }

      It 'Should create docker host serivce endpoints' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'Docker'} | Should not be $Null
      }

      It 'Should create docker registry serivce endpoints' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'Docker Registry'} | Should not be $Null
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll {
         # Clean up by removing the project and the folder created on disk
         _cleanUp -name $projectName
      }
   }
}

Describe 'Node_DockerPaaS' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)
      
   Context 'Default Agent' {
      
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default dockerpaas false " " "tcp://my2016dockerhost.westus.cloudapp.azure.com:2376" ".\test" "https://index.docker.io/v1/" "registryUsername" "3000:3000" "registryPassword" " " $env:PAT *> .\testresults\nodeDockerPaaSDefault.log
      
      It 'Should create project' {
         # I can't use Get-Project -Name because Name if validated against existing 
         # projects. If the project was not created an exception will be thrown and
         # confuse the test output.  By returning them all and use Where-Object to
         # locate the one I am looking for the test will fail without throwning the
         # validation exception.
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CI"} | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CD"} | Should not be $Null
      }

      It 'Should create docker host serivce endpoints' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'Docker'} | Should not be $Null
      }

      It 'Should create docker registry serivce endpoints' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'Docker Registry'} | Should not be $Null
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll {
         # Clean up by removing the project and the folder created on disk
         _cleanUp -name $projectName
      }
   }
}

Describe 'Node_DockerPaaS' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)
      
   Context 'Linux Agent' {
            node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " "Hosted Linux Preview" dockerpaas false " " " " " " "https://index.docker.io/v1/" "registryUsername" "3000:3000" "registryPassword" " " $env:PAT *> .\testresults\nodeDockerPaaSLinux.log
      
      It 'Should create project' {
         # I can't use Get-Project -Name because Name if validated against existing 
         # projects. If the project was not created an exception will be thrown and
         # confuse the test output.  By returning them all and use Where-Object to
         # locate the one I am looking for the test will fail without throwning the
         # validation exception.
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CI"} | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Where-Object {$_.Name -eq "$projectName-CD"} | Should not be $Null
      }

      It 'Should create azure serivce endpoint' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'PM_DonovanBrown'}  | Should not be $Null
      }

      It 'Should create docker registry serivce endpoints' {
         Get-ServiceEndpoint -ProjectName $projectName | Where-Object {$_.Name -eq 'Docker Registry'} | Should not be $Null
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll {
         # Clean up by removing the project and the folder created on disk
         _cleanUp -name $projectName
      }
   }
}