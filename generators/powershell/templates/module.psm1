# Dot sources all the files in Public, Private and Classes
# Then reads the file names in Public and exports them
# as the fucntions for the module.
# To export an alias you have to manually add it to the
# Export-ModuleMember below.
# The module manifest is using wildcard exports for functions
# and alias so you only have to name the files correctly.

# Files are built using a script in the root folder
. "$PSScriptRoot\<%= name %>.classes.ps1"
. "$PSScriptRoot\<%= name %>.functions.ps1"