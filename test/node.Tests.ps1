Describe 'Node' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)

   Context 'PaaS' {
      node $env:YO team node $projectName demonstrations PM_DonovanBrown " " " " " " Default paas false " " " " " " " " " " " " " " " " $env:PAT *> .\nodeProject.log
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      It 'Should create build definition' {
         Get-BuildDefinition -ProjectName $projectName | Should not be $Null
      }

      It 'Should create release definition' {
         Get-ReleaseDefinition -ProjectName $projectName | Should not be $Null
      }

      AfterAll {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Remove-Project -Force
         Remove-Item -Recurse -Force -Path $projectName
      }
   }   
}