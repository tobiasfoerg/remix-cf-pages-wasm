import { initWasm } from "@resvg/resvg-wasm";
import wasmBinary from "@resvg/resvg-wasm/index_bg.wasm";

/** @type {PagesFunction} */
export async function onRequest(context) {
	try {
		const url = new URL(context.request.url);
		if (url.pathname === "/social-preview.png") {
            console.log("init wasm")
			await initWasm(wasmBinary);
		}
		console.log("onRequest", context.request.url, url.pathname);
		return await context.next();
	} catch (err) {
		return new Response(`${err.message}\n${err.stack}`, { status: 500 });
	}
}
