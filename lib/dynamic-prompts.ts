import { EmojiLevel } from "./settings.js";

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
