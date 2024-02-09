import axios from 'axios';

export async function sendMessageToModel(userMessage: string) {
    console.log(userMessage);
    try {
        const response = await axios.post('http://localhost:1234/v1/chat/completions', {
            model: "local-model", // Adjust if your local server uses this field
            messages: [
                { "role": "system", "content": "Answer as a senior software engineer." },
                { "role": "user", "content": userMessage }
            ],
            temperature: 0.7,
        }, {
            // Headers might be needed depending on your server setup
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer not-needed' // Adjust according to your server's auth requirements
            }
        });

        // Handling the response from your local model server
        console.log(response.data);
        const completionMessage = response.data.choices[0].message;
        return completionMessage;
    } catch (error) {
        console.error('Error calling the local model server:', error);
        throw error; // Or handle error gracefully as needed
    }
}