Connect-AzureAD
Get-AzureADApplication -SearchString demonstrations
Get-AzureADApplication -SearchString demonstrations | Remove-AzureADApplication
Get-AzureADDeletedApplication -SearchString demonstrations -All $true | select -ExpandProperty objectid
Get-AzureADDeletedApplication -SearchString demonstrations -All $true | select -ExpandProperty objectid | Remove-AzureADMSDeletedDirectoryObject -Verbose