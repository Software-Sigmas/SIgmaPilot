<script lang="ts">
	const EFFICIENCY_PROMPT = 'Analyze for efficiency:\n';
	const FORMATTING_PROMPT = 'Analyze for formatting:\n';
	const EXPLANATION_PROMPT = 'Explain the code:\n';
	const MAXHEIGHT = 200;
	let answer = '';
	let prompt = '';
	let code = '';
	let selectedOption = '';

	const options = ['Formatting', 'Efficiency', 'Explanation'];

	// resize text area based on text amount
	function resizeTextarea(event?: Event) {
		let target: HTMLTextAreaElement;
		if (event) {
			target = event.target as HTMLTextAreaElement;
		} else {
			// Correctly select the textarea by its ID
			target = document.getElementById('mytextarea') as HTMLTextAreaElement;
		}
		if (!target) return; // Exit if textarea is not found, for safety
		target.style.height = 'auto';
		target.style.height = `${Math.min(target.scrollHeight, MAXHEIGHT)}px`;
	}

	// recieve commands from webview
	window.addEventListener('message', (event) => {
		const message = event.data;
		switch (message.command) {
			case 'setCode':
				code = message.code;
				setTimeout(resizeTextarea, 0);
				break;
			case 'quickReview':
				code = message.code;
				prompt = '';
				selectedOption = 'Explanation';
				setTimeout(resizeTextarea, 0);
				generateResponse();
				break;
			case 'modelResponse':
				answer = message.answer;
				break;
		}
	});

	function generateResponse() {
		let finalPrompt = 'Hello World';
		switch (selectedOption) {
			case 'Formatting':
				finalPrompt = FORMATTING_PROMPT;
				break;
			case 'Efficiency':
				finalPrompt = EFFICIENCY_PROMPT;
				break;
			case 'Explanation':
				finalPrompt = EXPLANATION_PROMPT;
				break;
			case '':
				finalPrompt = prompt + '\n';
				break;
			default:
				finalPrompt = EXPLANATION_PROMPT;
				break;
		}
		finalPrompt = finalPrompt + code;
		tsvscode.postMessage({ type: 'generateResponse', value: finalPrompt });
	}
</script>

<div>Custom Prompt:</div>

<form on:submit|preventDefault={() => {}}>
	<input bind:value={prompt} placeholder="Optional" disabled={selectedOption != ''} />
</form>

<div>Standard Prompt:</div>

<select bind:value={selectedOption}>
	<option value="" selected>Use Custom Prompt</option>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<div>Code:</div>

<form on:submit|preventDefault={() => {}}>
	<textarea id="mytextarea" bind:value={code} on:input={resizeTextarea} placeholder="Optional"></textarea>
</form>

<div>Answer:</div>

<button
	on:click={() => {
		generateResponse();
	}}>Generate</button
>

<div>{answer}</div>

<style>
	textarea {
		width: 100%;
		box-sizing: border-box; /* Ensures padding does not affect overall width */
		overflow-y: auto;
		resize: none; /* Disables manual resizing */
		max-height: 200px;
	}
</style>
