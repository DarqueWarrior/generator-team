Describe 'Project' {
   Context 'Create' {

      yo team:project unitTest demonstrations $env:PAT
      
      It 'Should create project' {
         Get-Project -Name unitTest | Should not be $Null
      }

      AfterAll { Get-Project | Where-Object {$_.Name -eq 'unitTest'} | Remove-Project -Force }
   }
}