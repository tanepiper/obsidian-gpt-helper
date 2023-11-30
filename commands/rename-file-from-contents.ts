import { Notice, Plugin } from "obsidian";
import { type DGOpenAIClient } from "../lib/gpt.js";
import { DigitalGardenerSettings } from "../lib/settings.js";

const COMMAND_PROMPT = `Your task is: Based on the content provided below, suggest a short filename under 50 characters that is valid for Obsidian.
The filename can contain any alphanumeric characters, dashes, underscores and spaces.  Please do not include the file extension, is we will
only deal with markdown files so it will be added automatically.

You will return the response as a JSON object like this:

{
	"filename": "my-filename"
}
`;

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function renameFileFromContents(
	plugin: Plugin & { openAI: DGOpenAIClient },
	settings: DigitalGardenerSettings
) {
	return {
		id: "dg-set-file-name",
		name: "Rename current file from contents",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();
					new Notice(`🧑🏼‍🌾 Getting new name for ${currentFileName}`);
					
					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestChat(
						COMMAND_PROMPT,
						contents,
						settings.openAIModel
					);
					const output = JSON.parse(result);
					this.app.vault.rename(
						file,
						`${paths.join("/")}/${output?.filename}.md`
					);
					new Notice(`🧑🏼‍🌾 Renamed file to ${output?.filename}.md`);
				}
				return true;
			}
			return false;
		},
	};
}
