# Change Log

## 1.0.0
- Add a command to switch the download source for scripts (branch or tag).
- Add a command to open the configuration panel.
- Expose some global variables and methods such as `_log()`, `_axios`, and more.
- Replace the `outputChannel` variable with `_outputChannel`.

## 0.3.0
- Asynchronous script handling.
- Added "dummyjson.json" example.
- Added ability to download an example script to local or global space from Github repo.
- Alert when attempting to write an existing script.

## 0.2.0
- Implement dynamic installation of dependencies using live-plugin-manager.
- Sanitized file names to ensure compatibility.
- Fixed: Non-script files are now hidden from the "Apply script" prompt.

## 0.1.0
Create a script as global.

## 0.0.3
Apply a script to multiple cursors.

## [Unreleased]
- Initial release