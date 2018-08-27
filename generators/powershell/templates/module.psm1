# Dot sources all the files in Public and Internal
# Then reads the file names in Public and exports them
# as the fucntions for the module.
# To export an alias you have to manually add it to the 
# Export-ModuleMember below.
# The module manifest still needs to be updated for best
# performance it does not use wildcard exports.
$functionFolders = @('Public', 'Internal', 'Classes')
ForEach ($folder in $functionFolders) {
   $folderPath = Join-Path -Path $PSScriptRoot -ChildPath $folder
   If (Test-Path -Path $folderPath) {
      Write-Verbose -Message "Importing from $folder"
      $functions = Get-ChildItem -Path $folderPath -Filter '*.ps1' 
      ForEach ($function in $functions) {
         Write-Verbose -Message "  Importing $($function.BaseName)"
         . $($function.FullName)
      }
   }    
}

$publicFunctions = (Get-ChildItem -Path "$PSScriptRoot\Public" -Filter '*.ps1').BaseName
Export-ModuleMember -Function $publicFunctions