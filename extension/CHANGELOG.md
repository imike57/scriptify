# Change Log

## 2.2.0

### Minor Changes

- 6e77336: - Added a tree view.

## 2.1.0

### Minor Changes

- 18046af: Exposed extension API with Storage service

### Patch Changes

- 9c5b45a: Fix readme images and links paths

## 2.0.2

### Patch Changes

- 295b8df: Fix repository property value

## 2.0.1

### Patch Changes

- - Fix: vm2 require path

## 2.0.0

### Major Changes

- 7d70286: - Completely revamped the script execution mechanism.
  - Scripts are now executed using the VM2 library for enhanced isolation and security.
  - Scripts are treated as executable packages with support for dependencies.
  - Introduced a configuration file ([scriptify.json])("../docs/scriptify.json.md") to define script properties such as environment variables, activation status, and file paths.
  - Enabled script downloads from the npm registry.
  - Removed global variables and methods from the previous version.
  - Updated example packages and add `prettier` example.

## 1.1.0

- Fixed the `dummyjson` example.
- Added the `openai` example.

## 1.0.0

- Added a command to switch the download source for scripts (branch or tag).
- Added a command to open the configuration panel.
- Exposed some global variables and methods, including `_log()`, `_axios`, and more.
- Replaced the `outputChannel` variable with `_outputChannel`.

## 0.3.0

- Implemented asynchronous script handling.
- Added the "dummyjson.json" example.
- Added the ability to download example scripts to the local or global space from the GitHub repository.
- Displayed an alert when attempting to write an existing script.

## 0.2.0

- Implemented dynamic installation of dependencies using the live-plugin-manager.
- Sanitized file names to ensure compatibility.
- Fixed an issue where non-script files were visible in the "Apply script" prompt.

## 0.1.0

- Added the ability to create a script as global.

## 0.0.3

- Added the ability to apply a script to multiple cursors.

## [Unreleased]

- Initial release
