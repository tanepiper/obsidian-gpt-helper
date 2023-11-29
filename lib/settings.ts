import introText from "./../prompts/introText.md";
import frontMatterText from "./../prompts/frontmatterText.md";
import contentText from "./../prompts/contentText.md";
import dataViewsText from "./../prompts/dataviewsText.md";
/**
 * Settings for the GPT Helper plugin
 */
export interface GPTHelperSettings {
	/**
	 * The users OpenAI API Key
	 */
	openAIAPIKey: string;
	/**fv
	 * The OpenAI Model to use
	 */
	openAIModel: string;
	/**
	 * The path to save new files generated by GPT
	 */
	outputPath: string;

	/**
	 * The temperature to use when generating text
	 */
	oaiTemperature: number;

	/**
	 * The intro text to use when generating new files
	 */
	introText: string;
	/**
	 * The content text to use when generating new files
	 */
	contentText: string;
	/**
	 * The frontmatter text to use when generating new files
	 */
	frontmatterText: string;
	/**
	 * The data view text to use when generating new files
	 */
	dataViewText: string;

	userName: string;
	userPronouns: string;
	userBio: string;
	userLanguages: string;
	emojiLevel: number;
}

export const DEFAULT_SETTINGS: GPTHelperSettings = {
	userName: "",
	userPronouns: "",
	userBio: "",
	userLanguages: "English (en-gb)",
	openAIAPIKey: "",
	openAIModel: "gpt-35-turbo",
	outputPath: "gpt-garden",
	oaiTemperature: 0.7,
	introText: introText.raw,
	contentText: contentText.raw,
	frontmatterText: frontMatterText.raw,
	dataViewText: dataViewsText.raw,
	emojiLevel: 1,
};

export const AVAILABLE_MODELS = {
	"gpt-4-vision-preview": "GPT4 Turbo + Vision",
	"gpt-4-1106-preview": "GPT4 Turbo",
	"gpt-4": "GPT-4",
	"gpt-35-turbo": "GPT3.5 Turbo",
};
