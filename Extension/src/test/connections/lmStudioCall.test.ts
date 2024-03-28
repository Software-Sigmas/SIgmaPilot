import * as assert from 'assert';
import * as sinon from 'sinon';
import axios from 'axios';
import { lmStudioCall } from '../../connections/lmStudioCall';

suite('lmStudioCall Test Suite', () => {
    let axiosPostStub: sinon.SinonStub;

    setup(() => {
        axiosPostStub = sinon.stub(axios, 'post');
    });

    teardown(() => {
        axiosPostStub.restore();
    });

    test('lmStudioCall sends the correct request and returns expected response', async () => {
        // Arrange
        const fakeResponse = { data: { choices: [{ message: { content: 'lm response' } }] } };
        axiosPostStub.resolves(fakeResponse);

        // Act
        const response = await lmStudioCall('test message', 'http://localhost:1234/v1/chat/completions', 'test-api', 100);

        // Assert
        assert.strictEqual(response, 'lm response');
    });
});
