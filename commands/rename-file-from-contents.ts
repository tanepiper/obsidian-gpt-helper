import { Notice } from "obsidian";
import { agents, prompts } from "../lib/settings.js";
import type GPTHelper from "../main.js";


/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function renameFileFromContents(
	plugin: GPTHelper,
) {
	return {
		id: "dg-rename-file-from-contents",
		name: "Rename current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();
					new Notice(`🧑🏼‍🌾 Getting new name for ${currentFileName}`);
					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						`${agents.digitalGardener}\n\n${prompts.renameFileFromContents}`,
						contents,
						plugin.settings.openAIModel
					);

					await plugin.app.fileManager.renameFile(file, `${paths.join('/')}/${result?.filename}.md`)
					new Notice(`🧑🏼‍🌾 ${currentFileName} Renamed to ${result?.filename}.md`);
				}
				return true;
			}
			return false;
		},
	};
}
