import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { lmStudioCall } from '../apiCalls/lmStudioCall'; // Update the path to where your function is exported

// Creating an instance of axios-mock-adapter for mocking axios requests
const mock = new MockAdapter(axios);

describe('lmStudioCall', () => {
    afterEach(() => {
        mock.reset(); // Ensure axios is clean before each test
    });

    it('should correctly handle a successful response', async () => {
        const mockResponse = { choices: [{ message: 'Test response' }] };
        mock.onPost('http://localhost:1234/v1/chat/completions').reply(200, mockResponse);
        const response = await lmStudioCall('Test message', 'http://localhost:1234/v1/chat/completions', 'not-needed', 50);
        expect(response).toEqual('Test response');
    });

    it('should throw an error on a failed request', async () => {
        mock.onPost('http://localhost:1234/v1/chat/completions').networkError();
        await expect(lmStudioCall('Test message', 'http://localhost:1234/v1/chat/completions', 'not-needed', 50))
            .rejects.toThrow('Error calling the model');
    });

    // Add more tests here as needed
});
