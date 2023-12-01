import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { DigitalGardenerSettings } from "./settings";
import { error } from "console";

export interface DGOpenAIClient {
	/**
	 * Instance of the OpenAI Client
	 */
	client: OpenAI;

	requestChat: (
		system: string,
		content: string,
		settings: DigitalGardenerSettings
	) => Promise<string>;

	requestJSON: (
		system: string,
		content: string,
		settings: DigitalGardenerSettings
	) => Promise<Record<string, any>>;
}

const RUN_IN_BROWSER_FOR_OBSIDIAN = true;

/**
 * Create an internal OpenAI Client for interacting with the API for chats and JSON
 * responses
 * @param apiKey
 * @returns
 */
export function createOpenAIClient(apiKey: string): DGOpenAIClient {
	/**
	 * OpenAI Client Instance
	 */
	const client = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: RUN_IN_BROWSER_FOR_OBSIDIAN,
	});

	/**
	 * Generate a prompt for OpenAI to use for chat
	 * @param system The system request to pass to OpenAI
	 * @param content The user content to pass to OpenAI
	 * @param model The model to use for the request
	 * @param json If the response should be JSON
	 * @returns A chat completion request object
	 */
	function generatePrompt(
		system: string,
		content: string,
		settings: DigitalGardenerSettings,
		json = false
	): ChatCompletionCreateParamsNonStreaming {
		const options: ChatCompletionCreateParamsNonStreaming = {
			messages: [
				{
					role: "system",
					content: system,
				},
				{ role: "user", content },
			],
			model: settings.openAIModel,
			stream: false,
		};
		if (settings.oaiTemperature) {
			options.temperature = settings.oaiTemperature;
		}
		if (settings.oaiMaxTokens) {
			options.max_tokens = settings.oaiMaxTokens;
		}
		if (json) {
			options.response_format = { type: "json_object" };
		}

		return options;
	}

	/**
	 * Make a request to OpenAI for a JSON response
	 * @param systemPrompt
	 * @param userPrompt
	 * @param model
	 * @returns
	 */
	async function requestJSON(
		systemPrompt: string,
		userPrompt: string,
		settings: DigitalGardenerSettings
	): Promise<Record<string, any>> {
		let result: Record<string, any> = {};
		try {
			const chatOptions = generatePrompt(
				systemPrompt,
				userPrompt,
				settings,
				true
			);
			const response = await client.chat.completions.create(chatOptions);

			if (response?.choices?.[0]?.message) {
				const content = response?.choices?.[0]?.message?.content;
				result = JSON.parse(content as string);
			}
		} catch (e: any) {
			console.error(e);
			result = {
				error: e.message,
				message: `My apologies, I am having trouble fetching a response from OpenAI.  Please try again.`,
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
		settings: DigitalGardenerSettings
	): Promise<string> {
		let result = "";
		try {
			const chatOptions = generatePrompt(system, content, settings);
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
