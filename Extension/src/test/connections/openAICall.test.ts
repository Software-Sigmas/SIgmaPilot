import * as assert from 'assert';
import * as sinon from 'sinon';
import axios from 'axios';
import { openAICall } from '../../connections/openAICall';

suite('openAICall Test Suite', () => {
    let axiosPostStub: sinon.SinonStub;

    setup(() => {
        axiosPostStub = sinon.stub(axios, 'post');
    });

    teardown(() => {
        axiosPostStub.restore();
    });

    test('openAICall sends the correct request and returns expected response', async () => {
        // Arrange
        // response.data.choices[0].message.content;
        const fakeResponse = { data: { choices: [{ message: { content: 'lm response' } }] } };
        axiosPostStub.resolves(fakeResponse);
        // Act
        const response = await openAICall('test message', 'http://localhost:1234/v1/chat/completions', 'test-api', 100);
        // Assert
        assert.strictEqual(response, 'lm response');
    });
});
