/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Env provides a mechanism to reference bindings declared in wrangler.toml within JavaScript
 *
 * @typedef {Object} Env
 * @property {DurableObjectNamespace} MY_DURABLE_OBJECT - The Durable Object namespace binding
 */

/** A Durable Object's behavior is defined in an exported Javascript class */

export class Counter {
	constructor(state, env) {
		this.state = state;
	}

	// Handle HTTP requests from clients.
	async fetch(request) {
		// Apply requested action.
		let url = new URL(request.url);

		// Durable Object storage is automatically cached in-memory, so reading the
		// same key every request is fast.
		// You could also store the value in a class member if you prefer.
		let value = (await this.state.storage.get('value')) || 0;

		switch (url.pathname) {
			case '/increment':
				++value;
				break;
			case '/decrement':
				--value;
				break;
			case '/':
				// Serves the current value.
				break;
			default:
				return new Response('Not found', { status: 404 });
		}

		// You do not have to worry about a concurrent request having modified the value in storage.
		// "input gates" will automatically protect against unwanted concurrency.
		// Read-modify-write is safe.
		await this.state.storage.put('value', value);

		return new Response(value);
	}
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param {Request} request - The request submitted to the Worker from the client
	 * @param {Env} env - The interface to reference bindings declared in wrangler.toml
	 * @param {ExecutionContext} ctx - The execution context of the Worker
	 * @returns {Promise<Response>} The response to be sent back to the client
	 */
	async fetch(request, env, ctx) {
		// We will create a `DurableObjectId` using the pathname from the Worker request
		// This id refers to a unique instance of our 'MyDurableObject' class above
		let id = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);

		// This stub creates a communication channel with the Durable Object instance
		// The Durable Object constructor will be invoked upon the first call for a given id
		let stub = env.MY_DURABLE_OBJECT.get(id);

		// We call `fetch()` on the stub to send a request to the Durable Object instance
		// The Durable Object instance will invoke its fetch handler to handle the request
		let response = await stub.fetch(request);

		return response;
	},
};
