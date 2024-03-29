import axios, {CancelTokenSource} from "axios";
/*
 * Sends a user message to a specified model API and returns the model's response.
 * Handles HTTP request creation, error handling, and extracts the relevant response content.
 * Supports various APIs, including OpenAI and local model servers, with customizable parameters.
 *
 * @param {string} userMessage - User message to be processed by the model.
 * @param {string} url - Model API endpoint URL.
 * @param {string} api - API key for authentication.
 * @param {number} tokens - Max number of tokens for the model's response.
 * @param {string} model - Identifier of the model.
 *
 * @returns {Promise<string>} Promise resolving with the model's response or rejecting with an error message.
 *
 * Errors from the model or network issues result in rejected promises with descriptive messages.
 */

let currentCancelTokenSource: CancelTokenSource | null = null;

export async function modelConnection(
	userMessage: string,
	url: string,
	api: string,
	tokens: number,
	model: string
) {
	// Cancel the previous request if it's still ongoing
	if (currentCancelTokenSource !== null) {
		currentCancelTokenSource.cancel("Cancelled due to new request.");
	}

	// Create a new CancelToken for the current request
	currentCancelTokenSource = axios.CancelToken.source();

	try {
		const messages = [
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
				cancelToken: currentCancelTokenSource.token,
			}
		);
		currentCancelTokenSource = null;
		return response.data.choices[0].message.content;
	} catch (error) {
		currentCancelTokenSource = null;
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
				errorMessage = `${error.message}`;
			}
		} else if (error instanceof Error) {
			errorMessage = `Unexpected error: ${error.message}`;
		}
		throw new Error(errorMessage);
	}
}
