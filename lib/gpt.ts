import OpenAI from "openai";
import { type ChatCompletionCreateParams } from "openai/resources";
import { ModalCallOptions } from "../views/chat-modal";
import { DigitalGardenerSettings } from "./settings";
import { json } from "stream/consumers";
import { ChatCompletionCreateParamsBase, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import digitalGardener from "../agents/digital-gardener.md";
import pagePrompt from '../prompts/page-content.md';

export interface DGOpenAIClient {
	/**
	 * Instance of the OpenAI Client
	 */
	client: OpenAI;

	requestChat: (
		system: string,
		content: string,
		model: string
	) => Promise<string>;

	requestJSON: (
		system: string,
		content: string,
		model: string
	) => Promise<Record<string, any>>;
}

const RUN_IN_BROWSER_FOR_OBSIDIAN = true;

export function createOpenAIClient(apiKey: string): DGOpenAIClient {
	const client = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: RUN_IN_BROWSER_FOR_OBSIDIAN,
	});

	function generatePrompt(
		system: string,
		content: string,
		model: string,
		json = false,
	): ChatCompletionCreateParamsNonStreaming {
		const options: ChatCompletionCreateParamsNonStreaming = {
			messages: [
				{
					role: "system",
					content: system,
				},
				{ role: "user", content },
			],
			model,
			stream: false,
		};
		if (json) {
			options.response_format = { type: "json_object" };
		}

		return options;
	}

	async function requestJSON(
		system: string,
		content: string,
		model: string
	): Promise<Record<string, any>> {
		let result: Record<string, any> = {};
		try {
			const chatOptions = generatePrompt(system, content, model, true);
			const response = await client.chat.completions.create(chatOptions);

			if (response?.choices?.[0]?.message) {
				const content = response?.choices?.[0]?.message?.content;
				result = JSON.parse(content as string);
			}
		} catch (e) {
			console.error(e);
			result = {
				error: `My apologies, I am having trouble fetching a response from OpenAI.  Please try again.`,
			};
		}

		return result;
	}

	/**
	 * Request a chat response from OpenAI, if there is an error in fetching
	 * the response, return an empty string for the result to be handled
	 * @param content
	 * @returns
	 */
	async function requestChat(
		system: string,
		content: string,
		model: string
	): Promise<string> {
		let result = "";
		try {
			const chatOptions = generatePrompt(system, content, model);
			const response = await client.chat.completions.create(chatOptions);

			if (response?.choices?.[0]?.message) {
				result = response?.choices?.[0]?.message.content as string;
			}
		} catch (e) {
			console.error(e);
			result = `My apologies, I am having trouble fetching a response from OpenAI.  Please try again.`;
		}

		return result;
	}

	return {
		client,
		requestChat,
		requestJSON,
	};
}

export function getFilenameFromContent(): string {
	return `Based on this content, suggest a short filename under 50 characters that is valid for Obsidian - the filename can
	any alphanumeric characters, dashes, underscores and spaces.  Please do not include the file extension.

	You will return the response as a JSON object like this:

	{
		"filename": "my-filename"
	}
	`;
}

export function buildPrompt(
	options: ModalCallOptions,
	activePrompts: DigitalGardenerSettings
) {

	let prompt = `${digitalGardener}`;
	prompt += `${pagePrompt}`;
	console.log(prompt);
	return prompt;
	// let prompt = "";
	// if (options.createNewFile) {
	// 	prompt +=
	// 		"You are creating a new file so please ensure you include the following prompts in your response:";
	// }
	// if (options.emojiLevel > 0) {
	// 	prompt += "The user has selected a level of emoji usage of ";
	// 	prompt +=
	// 		activePrompts.emojiLevel === 2
	// 			? "high - this means feel free to liberally use emojis in your response to make it more fun and engaging! 🎉"
	// 			: "medium - this means the user is ok with some emoji in the response but not too many. 😊";
	// } else {
	// 	prompt +=
	// 		"The user has selected that you use no emjois in your response, please keep this in mind when writing your response unless explicity asked by the user to give it";
	// }
	// if (activePrompts.userName) {
	// 	prompt += "\n\n";
	// 	prompt += `The user has asked that you address them as ${activePrompts.userName}. `;
	// }
	// if (activePrompts.userPronouns) {
	// 	prompt += `The user has asked that you use the pronouns ${activePrompts.userPronouns}. `;
	// }
	// if (activePrompts.userLanguages) {
	// 	prompt += `The user has asked that you use the following languages in responding: ${activePrompts.userLanguages}. `;
	// }
	// if (activePrompts.userBio) {
	// 	prompt += `The user has given the following bio for you to use when considering responses to them: ${activePrompts.userBio}. `;
	// }
	// if (options.includeIntroText) {
	// 	prompt += activePrompts.introText;
	// }
	// if (options.includeFrontMatterText) {
	// 	prompt +=
	// 		"The user has selected frontmatter so make sure you include some please";
	// 	prompt += activePrompts.frontmatterText;
	// }
	// if (options.includeContentText) {
	// 	prompt += activePrompts.contentText;
	// }
	// if (options.includeDataViewsText) {
	// 	prompt += activePrompts.dataViewText;
	// }

	//return prompt;
}
