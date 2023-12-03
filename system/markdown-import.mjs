import { readFile } from "fs/promises";
import path from "path";

// Optional: Import a Markdown parser if needed
// const marked = require('marked');

export default function markdownPlugin() {
	return {
		name: "markdown",
		setup(build) {
			build.onResolve({ filter: /\.md$/ }, (args) => {
				// Resolve the full path of the markdown file
				const fullPath = path.resolve(args.resolveDir, args.path);
				return {
					path: fullPath,
					namespace: "markdown",
				};
			});

			build.onLoad(
				{ filter: /.*/, namespace: "markdown" },
				async (args) => {
					let text = await readFile(args.path, "utf8");
					// Optional: Convert Markdown to HTML
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
