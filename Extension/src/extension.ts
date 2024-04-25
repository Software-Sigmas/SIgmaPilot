// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";
import { modelConnection } from "./modelConnection";

// Registering of all commands used by extension.
export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"sigma-pilot-sidebar",
			sidebarProvider
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("sigma-pilot.refresh", async () => {
			await vscode.commands.executeCommand(
				"workbench.action.closeSidebar"
			);
			await vscode.commands.executeCommand(
				"workbench.view.extension.sigma-pilot-sidebar-view"
			);
		})
	);

	// copy to sidebar keyboard shortcut command
	const disposable = vscode.commands.registerCommand(
		"sigma-pilot.copySelectedCodeToSidebar",
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const selection = editor.selection;
				const selectedText = editor.document.getText(selection);
				// Send the selected text to the sidebar
				sidebarProvider.postMessage({
					command: "setCode",
					data: selectedText,
				});
			}
		}
	);

	// run quick review keyboard shortcut command
	const disposable2 = vscode.commands.registerCommand(
		"sigma-pilot.runQuickReview",
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const selection = editor.selection;
				const selectedText = editor.document.getText(selection);
				// Send the selected text to the sidebar
				sidebarProvider.postMessage({
					command: "quickReview",
					data: selectedText,
				});
			}
		}
	);

	// Function to validate required settings based on the connection type
	function validateSettings(
		config: vscode.WorkspaceConfiguration
	): string | null {
		if (!config.get<string>("enterUrl")) {
			return "URL is missing. Please fill in the URL in the extension's settings.";
		}
		return null;
	}

	const disposable3 = vscode.commands.registerCommand(
		"sigma-pilot.modelConnection",
		async (userPrompt) => {
			// getting user configurations that they set in settings
			const config = vscode.workspace.getConfiguration("SigmaPilot");
			const setApiKey = config.get<string>("enterApiKey", "");
			const setUrl = config.get<string>("enterUrl", "");
			const setTokens = config.get<number>("maxTokenAmount", 256);
			const setModelName = config.get<string>(
				"enterModelName",
				"local-model"
			);

			// Validate settings based on connection type
			const errorMessage = validateSettings(config);
			if (errorMessage) {
				vscode.window.showErrorMessage(errorMessage);
				sidebarProvider.postMessage({
					command: "error",
					data: errorMessage.includes("API Key") ? "api" : "url",
				});
				return;
			}

			try {
				const modelResponse = await modelConnection(
					userPrompt,
					setUrl,
					setApiKey,
					setTokens,
					setModelName
				);
				sidebarProvider.postMessage({
					command: "modelResponse",
					data: modelResponse,
				});
			} catch (error) {
				if (error instanceof Error) {
					// Use vscode.window.showErrorMessage to display the error to the user
					vscode.window.showErrorMessage(error.message);
					sidebarProvider.postMessage({
						command: "error",
						data: error.message,
					});
				} else {
					// Fallback for non-Error objects
					vscode.window.showErrorMessage(
						"An unexpected error occurred. Please try again."
					);
					sidebarProvider.postMessage({
						command: "error",
						data: "An unexpected error occurred. Please try again.",
					});
				}
			}
		}
	);

	// open configuration settings from command palette
	const disposable4 = vscode.commands.registerCommand(
		"sigma-pilot.openSettings",
		() => {
			vscode.commands.executeCommand(
				"workbench.action.openSettings",
				"@ext:sigmas.sigma-pilot"
			);
		}
	);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
}

// This method is called when your extension is deactivated
export function deactivate() {}
