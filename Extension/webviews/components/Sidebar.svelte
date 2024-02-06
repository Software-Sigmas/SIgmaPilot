<script lang="ts">
    import type { CompletionItemKind } from "vscode";

    let todos: Array<{text: string, completed: boolean}> = []
    let answer= '';
    let text = '';
    let question =''
</script>

<div>Question</div>

<input bind:value={question}/>

<div>Question: {question}</div>
<div>Answer: {answer}</div>
<button on:click={()=>{
    answer = 'AI generated prompt goes here'
}}>Answer</button>


