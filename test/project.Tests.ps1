Describe 'Project' {
   $projectName = "project" + (New-Guid).Guid.SubString(0, 5)

   Context 'Create' {
      # The *> makes sure the ouput from yo does not throw off the build
      # can cause false negatives
      Write-Host "    Working with project $projectName" 
      node $env:YO team:project $projectName demonstrations $env:PAT *> ".\testresults\$projectName.log"
      
      It 'Should create project' {
         Get-Project | Where-Object {$_.Name -eq $projectName} | Should not be $Null
      }

      AfterAll { Get-Project | Where-Object {$_.Name -eq $projectName} | Remove-Project -Force }
   }
}