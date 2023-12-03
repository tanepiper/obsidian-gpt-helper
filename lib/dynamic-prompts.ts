import { DigitalGardenerSettings, EmojiLevel } from "./settings.js";
import digitalGardenerPrompt from "../agents/digital-gardener.md";
import systemPrompt from "../prompts/system-prompts.md";
import { ModalCallOptions } from "../modals/chat-modal.js";
import DigitalGardener from "main.js";
import { findAllTags } from "./obsidian.js";

function getTodaysDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


export async function generateInitialPrompt(
	plugin: DigitalGardener,
	options?: ModalCallOptions
): Promise<string> {
	console.log(options)
	const { settings } = plugin;
	let prompt = `${digitalGardenerPrompt}\n\n`;
	prompt += `${systemPrompt}\n\n`;

	prompt += `Some additional important information:\n\n`;
	prompt += `Today's date: ${getTodaysDateFormatted()}\n\n`;

	prompt += `The current time: ${new Date().toLocaleTimeString()}\n\n`;
	prompt += `The current Obsidian vault name: ${plugin.app.vault.getName()}\n\n`;
	prompt += `The current Obsidian vault config dir is: ${plugin.app.vault.configDir}\n\n`;

	const keys = await plugin.getAllUniqueFrontmatterKeys();
	const dontReplaceKeys = ["title", "createdAt", "status", "author"];
	prompt += `Here are all the frontmatter keys available in the current vault, ensure reuse ones that are relevant:\n\n`;
	prompt += `${JSON.stringify(Array.from(keys), null, 2)}\n\n`;
	prompt += `IF A KEY ALREADY HAS A VALUE IGNORE IT AND DO NOT REPLACE THE CURRENT VALUE\n\n`;

	if (options?.includePersonalisation === true) {
		prompt += `The following is the personalisation information the user have provided:\n\n`;
		prompt += `Name: ${settings.userName}\n`;
		prompt += `Pronouns: ${settings.userPronouns}\n`;
		prompt += `Preferred Language: ${settings.userLanguages}\n`;
		prompt += `Biograph: ${settings.userBio}\n\n`;
	}

	if (options?.includeFilenames === true) {
		const allMarkdownFiles = plugin.app.vault.getMarkdownFiles();
		const allMDFileNames = Object.fromEntries(
			allMarkdownFiles.map((file) => [file.path, file.name])
		);
		prompt += `The following is a list of all markdown files in the current Obsidian vault:
	${JSON.stringify(allMDFileNames, null, 2)}
	When creating the content, create wikilinks to relevant files, these files exist in the list above
	Obsidian's [[FILENAME]] WikiLinks to connect the content.`;
	}
	if (options?.includeTags === true) {
		const tags = new Set<string>();

		plugin.app.vault.getMarkdownFiles().forEach((file) => {
			findAllTags(plugin.app, file, tags);
		});

		prompt += `\n\n`;
		prompt += `The following is a list of all tags in the current Obsidian vault:
	${JSON.stringify(Array.from(tags), null, 2)}
	When creating the content, create wikilinks to relevant tags, these tags exist in the list above
	`;
	}
	console.log(prompt);

	return prompt;
}

/**
 * Create a prompt for the user to select an emoji level
 * @param emojiLevel
 * @returns
 */
export function createEmojiLevelSetting(emojiLevel: EmojiLevel) {
	let prompt = `emojiLevel: ${emojiLevel}\n`;
	switch (emojiLevel) {
		case "none":
			prompt += `The user has requested no emojis - keep the response free of emojis`;
			break;
		case "low":
			prompt += `The user will allow a low amount of appropriate emojis in the response`;
			break;
		case "medium":
			prompt += `The user will allow an appropriate emojis in the response`;
			break;
		case "high":
			prompt += `The user has asked you to be creative and use emojis as you like in the response`;
			break;
	}
	return prompt;
}
