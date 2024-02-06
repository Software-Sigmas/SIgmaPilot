<script lang="ts">
	let answer = '';
	let prompt = '';
	let code = '';
    let selectedOption = '';

    const options = [
        "Formatting",
        "Efficiency",
        "Security",
        "Variable Naming",
        "Explanation"
    ];

    function resizeTextarea(event: Event) {
       const target = event.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    }
</script>

<div>Custom Prompt:</div>

<form
	on:submit|preventDefault={() => {
		answer = 'AI generated result goes here';
	}}
>
	<input bind:value={prompt} placeholder="Optional" disabled={selectedOption != ""}/>
</form>

<div>Standard Prompt:</div>

<select bind:value={selectedOption}>
    <option value="" selected>Use Custom Prompt</option>
    {#each options as option}
        <option value={option}>{option}</option>
    {/each}
</select>

<div>Code:</div>

<form
	on:submit|preventDefault={() => {
		answer = 'AI generated result goes here';
	}}
>
	<textarea bind:value={code} on:input={resizeTextarea} rows="1" placeholder="Optional"></textarea>
</form>

<div>Answer:</div>

<button
	on:click={() => {
		answer = 'AI generated answer goes here';
	}}>Generate</button
>

<div> {answer} </div>

<style>
    textarea {
        width: 100%;
        box-sizing: border-box; /* Ensures padding does not affect overall width */
        overflow-y: hidden; /* Hides the scrollbar */
        resize: none; /* Disables manual resizing */
    }
</style>
