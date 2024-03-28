import axios from "axios";

// for LM studio: URL: http://localhost:1234/v1/chat/completions
// for OpenAI: URL: https://api.openai.com/v1/chat/completions
//

export async function modelConnection(
	userMessage: string,
	url: string,
	api: string,
	tokens: number,
	model: string
) {
	try {
		const messages = [
			// {
			// 	role: "system",
			// 	content: "",
			// },
			{
				role: "user",
				content: userMessage,
			},
		];

		const response = await axios.post(
			url,
			{
				model: model,
				messages: messages,
				max_tokens: tokens,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${api}`,
				},
			}
		);
		console.log(response);
		console.log(response.data.choices[0].message.content);
		return response.data.choices[0].message.content;
	} catch (error) {
		console.log(error);
		let errorMessage = "An unexpected error occurred.";
		if (axios.isAxiosError(error)) {
			if (error.response) {
				switch (error.response.status) {
					case 400:
						errorMessage =
							"Bad Request: The server could not understand the request due to invalid syntax. Check model name.";
						break;
					case 401:
						errorMessage =
							"Unauthorized: Please check your API key.";
						break;
					case 403:
						errorMessage =
							"Forbidden: Access to the resource is denied.";
						break;
					case 404:
						errorMessage =
							"Not Found: The requested resource was not found. Check model name.";
						break;
					case 429:
						errorMessage =
							"Too Many Requests: You have sent too many requests in a given amount of time.";
						break;
					case 500:
						errorMessage =
							"Internal Server Error: The server has encountered a situation it doesn't know how to handle.";
						break;
					default:
						errorMessage = `Unexpected Error: ${
							error.response.data.error.message || error.message
						}`;
						break;
				}
			} else {
				errorMessage = `Axios error: ${error.message}`;
			}
		} else if (error instanceof Error) {
			errorMessage = `Unexpected error: ${error.message}`;
		}
		throw new Error(errorMessage);
	}
}
