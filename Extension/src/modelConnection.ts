import axios from 'axios';

// for LM studio: URL: http://localhost:1234/v1/chat/completions
// for OpenAI: https://api.openai.com/v1/completions

export async function sendMessageToModel(userMessage: string, type:string, url:string, api:string, tokens:number) {
    console.log(userMessage);
    console.log(type);
    switch (type) {
        case 'LM Studio': {
            return await lmStudioCall(userMessage, url, api, tokens);
            break;
        }
        case 'OpenAI API': {
            return await openAICall(userMessage, url, api, tokens);
            break;
        }
    }
}

async function lmStudioCall(userMessage: string, url:string, api:string, tokens:number) {
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
        console.log(response.data);
        const completionMessage = response.data.choices[0].message;
        return completionMessage;
    } catch (error) {
        console.error('Error calling the model:', error);
        throw error; 
    }
} 

async function openAICall(userMessage: string, url:string, api:string, tokens:number) {
    console.log(url);
   try {
        const response = await axios.post(
            url,
            {
                prompt: userMessage,
                model: "gpt-3.5-turbo-0125",
                tokens: tokens,
                // Add additional parameters as needed
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error; // Rethrow the error for further handling if necessary
    }
} 