import { App, TFile } from "obsidian";

export function findAllTags(app: App, file: TFile, allTags: Set<string>): void {
	const metadata = app.metadataCache.getCache(file.path);

	// Extract tags from frontmatter and content
	if (metadata && metadata.tags) {
		metadata.tags.forEach((tag) => {
			allTags.add(tag.tag);
		});
	}
}
