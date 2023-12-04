import { DGSelectModal } from "../modals/select-modal.js";
import { Notice } from "obsidian";
import { agents } from "../lib/settings.js";
import type DigitalGardener from "../main.js";
import renameFileFromContentsPrompt from "./rename-file-from-contents.md";
import { ChatCompletionMessageParam } from "openai/resources/index.js";
/**
 * A response from the OpenAI API that contains a filename with the reason and score for it's selection
 */
interface DGFileNameResponse {
	/**
	 * The filename, it should support all OS with only alphanumeric characters, spaces, hyphens, and underscores.
	 * Spaces and hyphens are preferred over underscores.
	 */
	fileName: string;
	/**
	 * The agent reason for selecting this filename
	 */
	reason: string;
	/**
	 * The confidence score for this filename the AI thinks it should be
	 */
	score: number;
}

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function cmdRenameFileFromContents(plugin: DigitalGardener) {
	const settings = plugin.state.getSettings();

	return {
		id: "dg-rename-file-from-contents",
		name: "Rename file from contents",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const paths = file.path?.split("/") ?? [];
					let currentFileName = paths.pop();
					currentFileName = currentFileName?.replace(".md", "");

					let prompt = `${agents.digitalGardener}\n\n`;
					prompt += `${renameFileFromContentsPrompt}`;

					new Notice(
						`🧑🏼‍🌾 Finding new names\nFinding a new name for ${currentFileName}`
					);

					let time = 0;
					const timer = plugin.registerInterval(
						window.setInterval(() => {
							time++;
							plugin.updateDefaultStatusText(
								`Rename file from contents: ${time}s`
							);
						}, 1000)
					);

					const contents = await plugin.app.vault.cachedRead(file);
					const messages: ChatCompletionMessageParam[] = [
						{ role: "system", content: prompt },
						{ role: "user", content: `${contents}` },
					];
					const result = await plugin.openAI.requestJSON(messages);
					window.clearInterval(timer);
					plugin.updateDefaultStatusText();

					new DGSelectModal(
						plugin,
						{
							title: "Select a new file name",
							type: "select",
							instructions: `I've generated a bunch of new file names for you to choose from, select the one you like the most or you can cancel - you can hover over the options to see the reason and score for the selection`,
							options: (result?.filenames ?? []).map(
								(filename: DGFileNameResponse) => {
									return {
										label: filename.fileName,
										description: `Select this to rename the file to ${filename.fileName}.md`,
										value: filename.fileName,
										reason: filename.reason,
										score: filename.score,
									};
								}
							),
						},

						async ([option]) => {
							new Notice(
								`🧑🏼‍🌾 File Renamed\n\n${currentFileName} Renamed to ${option}`
							);

							await plugin.app.fileManager.renameFile(
								file,
								`${paths.join("/")}/${option.value}.md`
							);
						}
					).open();
				}
				return true;
			}
			return false;
		},
	};
}
