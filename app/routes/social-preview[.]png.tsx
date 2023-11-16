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
