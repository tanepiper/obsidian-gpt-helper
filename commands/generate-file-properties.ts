import { generateInitialPrompt } from "lib/dynamic-prompts.js";
import { DGSelectModal } from "modals/select-modal.js";
import { Notice } from "obsidian";
import type DigitalGardener from "../main.js";
import { DGMessageModal } from "../modals/simple-modal.js";
import generateFilePropertiesPrompt from "./generate-file-properties.md";
/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function cmdGenerateFileProperties(plugin: DigitalGardener) {
	const settings = plugin.state.getSettings();

	return {
		id: "dg-generate-file-properties",
		name: "Generate properties for current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();

					let prompt = await generateInitialPrompt(plugin);
					prompt += `${generateFilePropertiesPrompt}\n\n`;
					new Notice(
						`🧑🏼‍🌾 Checking ${currentFileName} for new properties`
					);

					let time = 0;
					const timer = plugin.registerInterval(
						window.setInterval(() => {
							time++;
							plugin.updateDefaultStatusText(
								`Getting new properties: ${time}s`
							);
						}, 1000)
					);

					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						prompt,
						contents,
						settings
					);
					console.log(result);
					window.clearInterval(timer);
					plugin.updateDefaultStatusText();

					if (!result?.frontmatter) {
						new DGMessageModal(plugin, {
							title: "No properties generated",
							message: `No properties were generated for ${currentFileName}`,
						}).open();
						return;
					} else {
						new DGSelectModal(
							plugin,
							{
								type: "enable",
								title: "Select properties to add",
								options: result.frontmatter.map((fm: any) => {
									return {
										label: fm.key,
										description: fm.value,
										value: fm.value,
										reason: fm.reason,
										score: fm.score,
									};
								}),
								instructions: `I've generated a bunch of new properties for you to choose from, select the ones you want to add to the file`,
							},
							async (options) => {
								if (options.length === 0) {
									return;
								}
								new Notice(
									`🧑🏼‍🌾 Action Cancelled\n
									${currentFileName} not modified`
								);

								const newPropsObject = Object.fromEntries(
									options.map((option: any) => [
										option.label,
										option.value,
									])
								);
								await plugin.app.fileManager.processFrontMatter(
									file,
									(frontmatter) => {
										Object.assign(
											frontmatter,
											newPropsObject
										);
									}
								);
								new Notice(
									`🧑🏼‍🌾 Properties Updated\n
									New properties set in ${currentFileName}`
								);
							}
						).open();
					}
				}
				return true;
			}
			return false;
		},
	};
}
