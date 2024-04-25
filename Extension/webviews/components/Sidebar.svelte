<script lang="ts">
	import {
		EFFICIENCY_PROMPT,
		FORMATTING_PROMPT,
		EXPLANATION_PROMPT,
		options,
		resizeTextarea,
	} from "./Constants";

	let answer = "";
	let prompt = "";
	let code = "";
	let selectedOption = "";
	let isLoading = false;

	// recieve commands from webview
	window.addEventListener("message", (event) => {
		const message = event.data;
		switch (message.command) {
			case "setCode":
				code = message.data;
				setTimeout(resizeTextarea, 0);
				break;
			case "quickReview":
				code = message.data;
				prompt = "";
				selectedOption = "Explanation";
				setTimeout(resizeTextarea, 0);
				generateResponse();
				break;
			case "modelResponse":
				answer = message.data;
				isLoading = false;
				break;
			case "error":
				if (message.data.includes("new request") ) {
					answer = "";
				} else {
					isLoading = false;
				}
				break;
			default:
				break;
		}
	});

	function generateResponse() {
		let finalPrompt = "";

		switch (selectedOption) {
			case "Formatting":
				finalPrompt = FORMATTING_PROMPT;
				break;
			case "Efficiency":
				finalPrompt = EFFICIENCY_PROMPT;
				break;
			case "Explanation":
				finalPrompt = EXPLANATION_PROMPT;
				break;
			case "":
				finalPrompt = prompt + "\n";
				break;
			default:
				finalPrompt = EXPLANATION_PROMPT;
				break;
		}
		// do not allow communication with model without code or custom prompt.
		if (selectedOption == "" && prompt == "") {
			tsvscode.postMessage({
				type: "onError",
				value: "Please add custom prompt.",
			});
			return;
		}

		if (selectedOption != "" && code == "") {
			tsvscode.postMessage({
				type: "onError",
				value: "Please add code.",
			});
			return;
		}

		finalPrompt = finalPrompt + code;
		isLoading = true;
		try {
			tsvscode.postMessage({
				type: "generateResponse",
				value: finalPrompt,
			});
		} catch (e) {
			isLoading = false;
		}
	}
</script>

<div>Custom Prompt:</div>

<form on:submit|preventDefault={() => {}}>
	<input
		bind:value={prompt}
		placeholder="Optional"
		disabled={selectedOption != ""}
	/>
</form>

<div>Standard Prompt:</div>

<select bind:value={selectedOption} class="select-vscode-style">
	<option value="" selected>Use Custom Prompt</option>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<div>Code:</div>

<form on:submit|preventDefault={() => {}}>
	<textarea
		id="mytextarea"
		bind:value={code}
		on:input={resizeTextarea}
		placeholder="Optional"
	></textarea>
</form>

<button
	on:click={() => {
		generateResponse();
	}}>Generate</button
>

<div>Answer:</div>

<!-- Display loading indicator if isLoading is true -->
{#if isLoading}
	<div class="loader"></div>
{:else}
	<div id="answer">{answer}</div>
{/if}

<style>
	textarea {
		width: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		resize: none;
		max-height: 200px;
	}

	input:disabled {
		opacity: 20%;
	}

	.loader {
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border-left-color: #09f;
		animation: spin 1s ease infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.select-vscode-style {
		width: 100%;
		color: var(--vscode-foreground); /* Text color */
		background-color: var(
			--vscode-dropdown-background
		); /* Dropdown background */
		border: 1px solid var(--vscode-dropdown-border); /* Border color */
		padding: 5px 10px; /* Adjust padding as needed */
		font-size: var(--vscode-font-size); /* Match the font size */
		border-radius: var(
			--vscode-border-radius
		); /* Optional: if VSCode variables provide this */
		appearance: none; /* Removes default styling provided by browsers */
		-moz-appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}

	.select-vscode-style {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
		background-repeat: no-repeat;
		background-position: right 10px center;
		background-size: 12px;
	}

	#answer {
		white-space: pre-wrap;
	}
</style>
