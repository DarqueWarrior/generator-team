Connect-AzureAD
Get-AzureADApplication -SearchString demonstrations
Get-AzureADApplication -SearchString demonstrations | Remove-AzureADApplication
Get-AzureADDeletedApplication -SearchString demonstrations -All $true | Select-Object -ExpandProperty objectid
Get-AzureADDeletedApplication -SearchString demonstrations -All $true | Select-Object -ExpandProperty objectid | Remove-AzureADMSDeletedDirectoryObject -Verbose

#Get-AzureADDeletedApplication -All $true | where {$_.Displayname -like 'VisualStudioSPN*'} | select -ExpandProperty objectid | ForEach-Object { Remove-AzureADMSDeletedDirectoryObject -Id $_ -ErrorAction Continue }