import axios from 'axios';

export async function openAICall(userMessage: string, url: string, api: string, tokens: number) {
    try {
        const messages = [{
            role: "user",
            content: userMessage
        }];


        const response = await axios.post(
            url,
            {
                model: "gpt-3.5-turbo-0125",
                messages: messages,
                max_tokens: tokens,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api}`,
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error('Unexpected error:', error.message);
        } else {
            console.error('An unexpected error occurred');
        }
        throw error;
    }
}