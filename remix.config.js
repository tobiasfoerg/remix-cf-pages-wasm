/** @type {import('@remix-run/dev').AppConfig} */
export default {
	ignoredRouteFiles: ["**/.*"],
	server: "./server.ts",
	serverBuildPath: "functions/[[path]].js",
	serverConditions: ["workerd", "worker", "browser"],
	serverDependenciesToBundle: [
    ///^(?!@resvg\/resvg-wasm$).*/,
    /^(?!@resvg\/resvg-wasm$|@resvg\/resvg-wasm\/index_bg.wasm$).*/
  ],
	serverMainFields: ["browser", "module", "main"],
	serverMinify: true,
	serverModuleFormat: "esm",
	serverPlatform: "neutral",
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// publicPath: "/build/",
};
