---
"scriptify": major
---

- Completely revamped the script execution mechanism.
- Scripts are now executed using the VM2 library for enhanced isolation and security.
- Scripts are treated as executable packages with support for dependencies.
- Introduced a configuration file ([scriptify.json])("../docs/scriptify.json.md") to define script properties such as environment variables, activation status, and file paths.
- Enabled script downloads from the npm registry.
- Removed global variables and methods from the previous version.
- Updated example packages and add `prettier` example.
