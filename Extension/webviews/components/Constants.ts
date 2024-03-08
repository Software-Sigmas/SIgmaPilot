export const EFFICIENCY_PROMPT = 'Analyze for efficiency:\n';
export const FORMATTING_PROMPT = 'Analyze for formatting:\n';
export const EXPLANATION_PROMPT = 'Explain the code:\n';
export const MAXHEIGHT = 200;
export const options = ['Formatting', 'Efficiency', 'Explanation'];

// resize text area based on text amount
export function resizeTextarea(event?: Event) {
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