Describe 'Node_PaaS' {
   
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)

   Context 'Full' {
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default paas false " " " " " " " " " " " " " " " " $env:PAT *> .\nodePaaS.log
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Should not be $Null
      }

      It 'Should create azure serivce endpoint' {
         Get-ServiceEndpoint -ProjectName $projectName | Should not be $Null
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Should not be $Null
      }

      AfterAll {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Remove-Project -Force
         Remove-Item -Recurse -Force -Path $projectName
      }
   }
}

Describe 'Node_Docker' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)
      
   Context 'Full' {
      
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default docker false " " "tcp://my2016dockerhost.westus.cloudapp.azure.com:2376" ".\test" "https://index.docker.io/v1/" "unittest" "3000:3000" "unittests" " " $env:PAT *> .\nodeDocker.log
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Should not be $Null
      }

      It 'Should create both docker serivce endpoints' {
         (Get-ServiceEndpoint -ProjectName $projectName).Count | Should be 2
      }

      It 'Should create git repo endpoint' {
         Get-GitRepository -ProjectName $projectName | Should not be $Null
      }

      AfterAll {
         #   Get-Project | Where-Object {$_.Name -eq $projectName} | Remove-Project -Force
         #   Remove-Item -Recurse -Force -Path $projectName
      }
   }
}