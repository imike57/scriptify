import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from "axios";

import { PackageJSON } from "../defs/PackageJSON";
import { ScriptScope } from "../classes/ScriptScope";
import { NpmResponse } from '../defs/NpmResponse';
import { scriptifyConsole } from '../classes/console';
import { ClientConfig } from '../classes/ClientConfig';
import { spawn } from 'child_process';
import { scriptsTreeProvider } from '../extension';
import { getFavoritePackageManager, getScriptFolder, getVersion, openFormattedMarkdown } from '../utils';

/**
 * Downloads a script from a NPM repository and allows the user to choose to install it globally or locally.
 * @param keyword - Optional keyword to filter the search results.
 */
export function downloadScript(keyword?: string) {
  // TODO: Filter package for current version only.
  const compatibleVersion = getVersion();

  const npmScopedAPI = `https://registry.npmjs.org/-/v1/search?text=scope:scriptify-vscode${keyword ? `+${keyword}` : ''}&size=250`;

  axios<NpmResponse>({
    method: "get",
    url: npmScopedAPI,
    responseType: "json"
  }).then(results => {

    const base = [
      {
        label: "$(search-view-icon) Search",
        value: "search",
      },
      {
        label: "",
        kind: vscode.QuickPickItemKind.Separator
      }
    ];

    const list = results.data.objects.map(entry => {
      return {
        label: entry.package.name,
        value: entry.package.name,
        description: entry.package.description,
        data: entry
      };
    });

    // Show a quick pick menu to select a script
    vscode.window.showQuickPick([...base, ...list], {
      title: `Select a script (${compatibleVersion})`
    }).then(async (scriptChoice) => {

      if (scriptChoice) {

        if (scriptChoice.value === "search") {
          // Allow the user to search for a package
          vscode.window.showInputBox({
            title: "Search a package"
          }).then(keyword => {
            return downloadScript(keyword);
          });

        } else {
          // Show a quick pick menu to select the installation location
          const scopes: { label: string; value: ScriptScope; }[] = [
            {
              label: "Globally",
              value: ScriptScope.global
            },
            {
              label: "Locally",
              value: ScriptScope.local
            }
          ];

          vscode.window.showQuickPick(scopes, {
            title: "Where to install?"
          }).then(async (locationChoice) => {

            if (!locationChoice) {
              return;
            }

            // Load the client configuration
            const clientConfig = await new ClientConfig(locationChoice.value).load();
            const installArg = {
              npm: ["install"],
              pnpm: ["add"],
              yarn: ["add"]
            };
            const favoritePackageManager = getFavoritePackageManager();

            vscode.window.withProgress({ cancellable: true, location: vscode.ProgressLocation.Notification, title: "Installation in progress" }, async (progress, token) => {

              // Spawn a new process to install the script
              const installProcess = spawn(favoritePackageManager, [...installArg[favoritePackageManager], scriptChoice.label], { cwd: await getScriptFolder(locationChoice.value) });

              progress.report({ message: `Installing ${scriptChoice.label}`, increment: 0 });

              token.onCancellationRequested(() => {
                installProcess.kill();
              });

              return new Promise<"completed" | "cancelled">((resolve, reject) => {
                let errLog = "";
                let dataLog = "";

                installProcess.stderr.on('data', (err) => {
                  errLog += err.toString();
                });

                installProcess.stdout.on('data', (chunk) => {
                  dataLog += chunk.toString();
                });

                installProcess.on('exit', (code, signal) => {
                  if (signal === 'SIGINT') {
                    // Process has been cancelled (CTRL + C).                    
                    reject(new Error("Cancelled"));
                  } else if (code === 0) {
                    // The process is successfully completed.
                    resolve("completed");
                  } else if (signal === "SIGTERM") {
                    // Process has been killed.
                    resolve("cancelled");
                  } else {
                    reject(new Error(`The process ended with an error code: ${code}` + "\r" + errLog));
                  }
                });

                installProcess.on('error', (err) => {
                  reject(err);
                });
              });

            }).then(async (value) => {
              if (value === "completed") {
                // Get package JSON of the installed package
                const packagePath = path.join(await getScriptFolder(locationChoice.value), 'node_modules', scriptChoice.label);
                const packageJSON: PackageJSON = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8'));

                if (packageJSON) {
                  // Add the package to the client configuration
                  await clientConfig.addPackage(scriptChoice.label, { enabled: true, env: packageJSON.scriptify?.defaultEnv }).save();
                  scriptsTreeProvider.refresh();
                  vscode.window.showInformationMessage('Installation success');
                  openFormattedMarkdown(path.join(packagePath, "readme.md"));
                }
              } else {
                vscode.window.showInformationMessage('Installation cancelled');
              }
            }, (err) => {
              console.error(err);
              scriptifyConsole.error(err);
            });
          });
        }
      }
    });
  });
}
