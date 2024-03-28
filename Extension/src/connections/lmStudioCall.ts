import axios from 'axios';

// Function will send the user's message to the model that is being hosted on LM studios.
export async function lmStudioCall(userMessage: string, url:string, api:string, tokens:number) {
    try {
        const response = await axios.post(url, {
            model: "local-model",
            messages: [
                { "role": "system", "content": "Answer as a senior software engineer." },
                { "role": "user", "content": userMessage }
            ],
            temperature: 0.7,
            max_tokens: tokens,
        }, {
            // Headers might be needed depending on your server setup
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer not-needed' // Adjust according to your server's auth requirements
            }
        });

        // Handling the response from your local model server
        const completionMessage = response.data.choices[0].message.content;
        return completionMessage;
    } catch (error) {
        console.error('Error calling the model:', error);
        throw error; 
    }
} 
