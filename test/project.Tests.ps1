Describe 'Project' {
   Context 'Create' {

      node $env:YO team:project unitTest demonstrations $env:PAT
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq 'unitTest'} | Should not be $Null
      }

      It 'Should not create project' {
         Get-Project | Where-Object {$_.Name -eq 'unitTest'} | Should be $Null
      }

      AfterAll { Get-Project | Where-Object {$_.Name -eq 'unitTest'} | Remove-Project -Force }
   }
}