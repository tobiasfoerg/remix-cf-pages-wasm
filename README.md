# Remix Cloudflare Pages Wasm Server-Side

This example demonstrates how to init wasm for use in server side code of remix and cloudflare pages.

> The demo uses code from Jacob Paris blog post about generating social previews.
> https://www.jacobparis.com/content/remix-og

## Usage

```bash
pnpm install && pnpm dev
```

## `/social-preview.png`

To make wasm work i had to exclude `@resvg/resvg-wasm` from serverDependenciesToBundle in remix.config.js
```js
/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	server: "./server.ts",
	serverBuildPath: "functions/[[path]].js",
	serverConditions: ["workerd", "worker", "browser"],
	serverDependenciesToBundle: [
		// all except @resvg/resvg-wasm
        	/^(?!@resvg\/resvg-wasm$).*/,
    	],
	serverMainFields: ["browser", "module", "main"],
	serverMinify: true,
	serverModuleFormat: "esm",
	serverPlatform: "neutral",
};

```

I had to initialize the wasm in the `/functions/_middleware.js` file.
    
```js
import { initWasm } from "@resvg/resvg-wasm";
import wasmBinary from "@resvg/resvg-wasm/index_bg.wasm";

/** @type {PagesFunction} */
export async function onRequest(context) {
	try {
		const url = new URL(context.request.url);
        	// init wasm for the social-preview.png route only
		if (url.pathname === "/social-preview.png") {
			await initWasm(wasmBinary);
		}
		return await context.next();
	} catch (err) {
		return new Response(`${err.message}\n${err.stack}`, { status: 500 });
	}
}
```

Then i can use `Resvg`the in resource route `/app/routes/social-preview[.]png.tsx`.

```ts
import { Resvg } from "@resvg/resvg-wasm";
import satori from "satori";
import { getFont } from "~/misc";

export async function loader() {
	const svg = await satori(<div>test</div>, {
		width: 1200,
		height: 630,
		fonts: await getFont("Inter"),
	});

	const resvg = new Resvg(svg);
	const pngData = resvg.render();
	const data = pngData.asPng();

	return new Response(data, {
		headers: {
			"Content-Type": "image/png",
		},
	});
}
```

## `/social-preview-fail.png`

This example demonstrates how it fails when i try to init `wasm` and use `Resvg` in the resource route `/app/routes/social-preview-fail[.]png.tsx`.

```ts
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasmBinary from "@resvg/resvg-wasm/index_bg.wasm";
import satori from "satori";
import { getFont } from "~/misc";

export async function loader() {
	await initWasm(wasmBinary);
	const svg = await satori(<div>test</div>, {
		width: 1200,
		height: 630,
		fonts: await getFont("Inter"),
	});

	const resvg = new Resvg(svg);
	const pngData = resvg.render();
	const data = pngData.asPng();

	return new Response(data, {
		headers: {
			"Content-Type": "image/png",
		},
	});
}
```

The wasm file is handled like an asset in the `/public/build/_assets/index_bg-FX7W6XMT.wasm`

initWasm throws an error:
```console
TypeError: Fetch API cannot load: /build/_assets/index_bg-FX7W6XMT.wasm
    at __wbg_init (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:551:13)
    at initWasm (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:563:9)
    at async loader (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:52135:3)
    at async callRouteLoaderRR (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:4080:16)
    at async callLoaderOrAction (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:3169:16)
    at async Promise.all (index 0)
    at async loadRouteData (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:2873:19)
    at async queryImpl (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:2750:20)
    at async Object.queryRoute (file:///home/tfoerg/github/tobiasfoerg/remix-cf-pages-wasm/.wrangler/tmp/dev-RHmAo5/av75sfdu7h9.js:2731:18)
```

I tried excluding the wasm from bundling but that didn't help.  
Snippet from `/functions/[[...path]].js`
```js
import { initWasm, Resvg } from "@resvg/resvg-wasm";

// node_modules/.pnpm/@resvg+resvg-wasm@2.6.0/node_modules/@resvg/resvg-wasm/index_bg.wasm
var index_bg_default = "/build/_assets/index_bg-FX7W6XMT.wasm";
```

As far as i understand the wasm inmport should preserved as well, for server side wasm.
