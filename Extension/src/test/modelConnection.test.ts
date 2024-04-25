import * as assert from "assert";
import * as sinon from "sinon";
import axios from "axios";
import { modelConnection } from "../modelConnection";

suite("modelConnection Test Suite", () => {
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
			},
			isAxiosError: true,
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		return assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Unauthorized: Please check your API key./,
			"Did not throw with expected message for 401 Unauthorized error"
		);
	});

	test("modelConnection throws correct error message for 400 Bad Request", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 400,
			},
			isAxiosError: true,
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
			/Bad Request: The server could not understand the request due to invalid syntax. Check model name./,
			"Did not throw with expected message for 400 Bad Request error"
		);
	});

	// Test for 403 Forbidden error
	test("modelConnection throws correct error message for 403 Forbidden error", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 403,
			},
			isAxiosError: true,
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		return assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Forbidden: Access to the resource is denied./,
			"Did not throw with expected message for 403 Forbidden error"
		);
	});

	// Test for 404 Not Found error
	test("modelConnection throws correct error message for 404 Not Found error", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 404,
			},
			isAxiosError: true,
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		return assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Not Found: The requested resource was not found. Check model name./,
			"Did not throw with expected message for 404 Not Found error"
		);
	});

	// Test for 429 Too Many Requests error
	test("modelConnection throws correct error message for 429 Too Many Requests error", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 429,
			},
			isAxiosError: true,
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		return assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Too Many Requests: You have sent too many requests in a given amount of time./,
			"Did not throw with expected message for 429 Too Many Requests error"
		);
	});

	// Test for 500 Internal Server Error
	test("modelConnection throws correct error message for 500 Internal Server Error", async () => {
		// Arrange
		const errorResponse = {
			response: {
				status: 500,
			},
			isAxiosError: true,
		};
		axiosPostStub.rejects(errorResponse);

		// Act & Assert
		return assert.rejects(
			async () => {
				await modelConnection(
					"test message",
					"http://test-url.com",
					"test-api",
					100,
					"test-model"
				);
			},
			/Internal Server Error: The server has encountered a situation it doesn't know how to handle./,
			"Did not throw with expected message for 500 Internal Server Error"
		);
	});
});
