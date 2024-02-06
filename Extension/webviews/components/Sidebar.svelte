<script lang="ts">
    import type { CompletionItemKind } from "vscode";

    let todos: Array<{text: string, completed: boolean}> = []
    let answer= '';
    let text = '';
    let question =''
</script>

<div>Question</div>

<form 
    on:submit|preventDefault={() =>{
        answer = 'AI generated prompt goes here'
    }}>
    <input bind:value={question}/> 
</form>


<div>Question: {question}</div>
<div>Answer: {answer}</div>

<button on:click={()=>{
    answer = 'second prompt'
}}>Answer</button>


