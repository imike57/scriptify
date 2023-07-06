import * as vscode from 'vscode';

/** Open a markdown file formatted */
export function openFormattedMarkdown(filePath: string) {
    // Construction of URI for the Markdown file
    const markdownUri = vscode.Uri.file(filePath);
    vscode.commands.executeCommand('markdown.showPreview', markdownUri);
}
