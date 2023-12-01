import { readFile } from "fs/promises";
import path from "path";


export default function svgPlugin() {
	return {
		name: "svg",
		setup(build) {
			build.onResolve({ filter: /\.svg$/ }, (args) => {
				// Resolve the full path of the svg file
				const fullPath = path.resolve(args.resolveDir, args.path);
				return {
					path: fullPath,
					namespace: "svg",
				};
			});

			build.onLoad(
				{ filter: /.*/, namespace: "svg" },
				async (args) => {
					let text = await readFile(args.path, "utf8");
					// Optional: Convert svg to HTML
					// text = marked(text);

					return {
						contents: `export default ${JSON.stringify(text)}`,
						loader: "js",
					};
				}
			);
		},
	};
}
