param (
   [switch]$Syntax,
   [switch]$Unit,
   [switch]$Stage,
   [switch]$Version,
   [switch]$Publish,
   [string]$GalleryUri,
   [string]$NugetApiKey,
   [int]$Build,
   [string]$ModuleName = "<%= name %>",
   [string]$ReleaseDirectoryBase = "$pwd/Release",
   [string[]]$CopyToReleaseDirectory = @("./<%= name %>.psm1", './build.ps1', './README.md')
)


#### region Helpers
function Get-ReleaseDirectory {
   join-path $ReleaseDirectoryBase $ModuleName
}
function Assert-ReleaseDirectory {
   mkdir (Get-ReleaseDirectory)  -Force | Out-Null
}

function Remove-NugetFeed {
   param ($Name)
   Get-PSRepository | 
      where-object {$_.Name -like $Name} | 
      Unregister-PSRepository
}

function Assert-Gallery {
   param ([switch]$IncludeApiKey)
   if (-not [string]::IsNullOrEmpty($GalleryUri)) {
      Remove-NugetFeed -Name ReleaseFeed
      Register-NugetFeed -Name ReleaseFeed -SourceLocation $GalleryUri
   }
   if ($IncludeApiKey -and [string]::IsNullOrEmpty($NugetApiKey)) {
      throw "An Api Key is required."
   }
}

function Register-NugetFeed {
   param($Name, $SourceLocation)

   Register-PSRepository -Name $Name -SourceLocation $SourceLocation -PublishLocation "$($SourceLocation.trim('/'))/package"
}

function Test-VersionSettable {
   param ($VersionLine)
   ($VersionLine -like '*ModuleVersion*') -and ($VersionLine -match '\d+\.\d+\.\d+')
}

#### endregion Helpers

if ($Syntax) {
   Install-Module -Name PSScriptAnalyzer -F -Scope CurrentUser
   Invoke-ScriptAnalyzer -Path . -Recurse |
      Where-Object severity -eq \"Warning\" |
      ForEach-Object {
      Write-Host "##vso[task.logissue type=$($_.Severity);sourcepath=$($_.ScriptPath);linenumber=$($_.Line);columnnumber=$($_.Column);]$($_.Message)"
   }
}

if ($Unit) {
   Invoke-Pester ./test -EnableExit -Strict -OutputFile test-results.xml -OutputFormat NUnitXml -passthru
}

if ($Stage) {
   Assert-ReleaseDirectory    
   $CopyToReleaseDirectory | Copy-Item -Destination (Get-ReleaseDirectory)    
}

if ($Version) {
   Assert-ReleaseDirectory
   Get-Content ".\$ModuleName.psd1" |
      ForEach-Object { if (Test-VersionSettable $_) {
         $UpdatedVersion = $_.trim().trim("'") + ".$Build'"
         $UpdatedVersion
      }
      else {$_}
   } |
      Set-Content -Encoding UTF8 -Path "$(Get-ReleaseDirectory)/$ModuleName.psd1"
}

if ($Publish) {
   Assert-ReleaseDirectory
   Assert-Gallery -IncludeApiKey
    
   $PublishParameters = @{
      Path        = (Get-ReleaseDirectory)
      NugetApiKey = $NugetApiKey
      Force       = $true
      Repository  = 'PSGallery'
   }

   if (-not [string]::IsNullOrEmpty($GalleryUri)) {
      $PublishParameters.Repository = 'ReleaseFeed'
   }
   Install-PackageProvider -Name NuGet -Force -ForceBootstrap -scope CurrentUser
   Publish-Module @PublishParameters
}
