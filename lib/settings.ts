import agentDigitalGardener from "../agents/digital-gardener.md";
import newFileFromPrompt from '../prompts/page-content.md';
import renameFileFromContents from '../prompts/rename-file.md';
import generateProperties from '../prompts/generate-properties.md';
import generateWikiLinks from '../prompts/generate-wiki-links.md';


/**
 * Settings for the GPT Helper plugin
 */
export interface DigitalGardenerSettings {
	/**
	 * Root Application Folder
	 */
	rootFolder: string;
	/**
	 * The users OpenAI API Key
	 */
	openAIAPIKey: string;
	/**fv
	 * The OpenAI Model to use
	 */
	openAIModel: string;

	/**
	 * The temperature to use when generating text
	 */
	oaiTemperature: number;

	/**
	 * The maximum number of tokens to use when generating text
	 */
	oaiMaxTokens: number;
	/**
	 * The agent user name
	 */
	userName: string;
	/**
	 * The agent user pronouns
	 */
	userPronouns: string;
	/**
	 * The agent user bio
	 */
	userBio: string;
	/**
	 * The agent user languages
	 */
	userLanguages: string;

	/**
	 * The level of emoji usage
	 */
	emojiLevel: EmojiLevel;
}

export type EmojiLevel = "none" | "low" | "medium" | "high";

export const agents = {
	digitalGardener: `${agentDigitalGardener}`,
};

export const prompts = {
	renameFileFromContents: `${renameFileFromContents}`,
	newFileFromPrompt: `${newFileFromPrompt}`,
	generateProperties: `${generateProperties}`,
	generateWikiLinks: `${generateWikiLinks}`,
}

export const DEFAULT_SETTINGS: DigitalGardenerSettings = {
	rootFolder: "",
	userName: "",
	userPronouns: "",
	userBio: "",
	userLanguages: "English (en-gb)",
	openAIAPIKey: "",
	openAIModel: "gpt-35-turbo",
	oaiTemperature: 0.7,
	oaiMaxTokens: 10000,
	emojiLevel: "none",
};

export const AVAILABLE_MODELS = {
	"gpt-4-vision-preview": "GPT4 Turbo + Vision",
	"gpt-4-1106-preview": "GPT4 Turbo",
	"gpt-4": "GPT-4",
	"gpt-35-turbo": "GPT3.5 Turbo",
};
