$ModuleManifestName = '<%= name %>'
$ModuleManifestPath = "$PSScriptRoot\..\$ModuleManifestName.psd1"

Describe 'Module Manifest Supports Publishing' {

   $ManifestData = Get-Content -ReadCount 0 -Path $ModuleManifestPath | 
      Out-String | 
      Invoke-Expression

   It 'Has an Author' {
      [String]::IsNullOrEmpty( $ManifestData.Author ) | should be $false
   }

   It 'Has a Description' {
      [String]::IsNullOrEmpty( $ManifestData.Description ) | should be $false
   }

}
