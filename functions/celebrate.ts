export async function onRequest(context) {
	// Every unique ID refers to an individual instance of the Counter class that
	// has its own state. `idFromName()` always returns the same ID when given the
	// same string as input (and called on the same class), but never the same
	// ID for two different strings (or for different classes).
	let id = context.env.COUNTER.idFromName("name");

	// Construct the stub for the Durable Object using the ID. 
	// A stub is a client Object used to send messages to the Durable Object.
	let obj = context.env.COUNTER.get(id);

	// Send a request to the Durable Object, then await its response.
	let resp = await obj.fetch("http://example.com/increment");
	let count = await resp.text();

	return new Response(`Durable Object count: ${count}`);

}
