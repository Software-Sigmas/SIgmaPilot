// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';


export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
	  vscode.window.registerWebviewViewProvider("ai-reviewer-sidebar", sidebarProvider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ai-reviewer.refresh', async () => {

			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand("workbench.view.extension.ai-reviewer-sidebar-view");
		})
	);

	// keyboard shortcut command
	let disposable = vscode.commands.registerCommand('ai-reviewer.copySelectedCodeToSidebar', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
			// Send the selected text to the sidebar
            sidebarProvider.postMessage({
                command: 'setCode',
                code: selectedText,
            });
        }
    });

    context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
