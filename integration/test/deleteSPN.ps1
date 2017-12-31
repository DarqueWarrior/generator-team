[CmdletBinding()]
param(
   [string] $search, 
   [string] $pwd,
   [string] $email
)

$secpwd = ConvertTo-SecureString $pwd -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($email, $secpwd)
Connect-AzureAD -Credential $credential | Out-Null

Write-Verbose 'Delete Apps'
Get-AzureADApplication -SearchString $search | Remove-AzureADApplication
Write-Verbose 'Delete Deleted Apps'
Get-AzureADDeletedApplication -SearchString $search -All $true | Select-Object -ExpandProperty objectid | Remove-AzureADMSDeletedDirectoryObject