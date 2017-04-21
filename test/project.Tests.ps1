Describe 'Project' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)

   Context 'Create' {

      node $env:YO team:project $projectName demonstrations $env:PAT
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll { Get-Project | Where-Object {$_.Name -eq $projectName} | Remove-Project -Force }
   }
}