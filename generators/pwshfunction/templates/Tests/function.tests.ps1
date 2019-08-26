Set-StrictMode -Version Latest

. "$PSScriptRoot\..\..\Source\Public\<%= functionName %>.ps1"

Describe '<%= functionName %>' {
   Context 'Execute' {
      It 'Should run without error' {
         { <%= functionName %> } | Should Not Throw
      }
   }
}