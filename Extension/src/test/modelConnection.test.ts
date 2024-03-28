import * as assert from 'assert';
import * as sinon from 'sinon';
import axios from 'axios';
import { modelConnection } from '../modelConnection';

suite('modelConnection Test Suite', () => {
	let axiosPostStub: sinon.SinonStub;

	setup(() => {
		axiosPostStub = sinon.stub(axios, "post");
	});

	teardown(() => {
		axiosPostStub.restore();
	});

	test("modelConnection throws correct error message for 401 Unauthorized error", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 401,
				data: {
					error: {
						message: "Unauthorized: Please check your API key.",
					},
				},
			},
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		await assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Unauthorized: Please check your API key./, // This is the expected error message.
			"Did not throw with expected message for 401 Unauthorized error"
		);
	});

    test("modelConnection throws correct error message for 400 Bad Request", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 400,
				data: {
					error: {
						message: "Unauthorized: Please check your API key.",
					},
				},
			},
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		await assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Bad Request: The server could not understand the request due to invalid syntax. Check model name./, // This is the expected error message.
			"Did not throw with expected message for 400 Bad Request error"
		);
	});
});
