import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { DigitalGardenerSettings } from "./settings";
import { Chat } from "openai/resources";
import DigitalGardener from "main";
import { ModalCallOptions } from "modals/chat-modal";

export interface DGOpenAIClient {
	client: OpenAI;
	getChatHistory: (filePath: string) => Chat[];
	addToChatHistory: (filePath: string, content: Chat) => void;
	requestChat?: (
		messages: ChatCompletionMessageParam[],
		options: ModalCallOptions,
	) => Promise<string>;
	requestJSON: (
		messages: ChatCompletionMessageParam[],
		options?: ModalCallOptions,
	) => Promise<Record<string, any>>;
}

const RUN_IN_BROWSER_FOR_OBSIDIAN = true;
const DEFAULT_ERROR_MESSAGE =
	"My apologies, I am having trouble fetching a response from OpenAI. Please try again.";

/**
 * Create an internal OpenAI Client for interacting with the API for chats and JSON responses
 */
export function createOpenAIClient(
	plugin: DigitalGardener,
	apiKey: string
): DGOpenAIClient {
	const chatHistories: Record<string, Chat[]> = {};

	function getChatHistory(filePath: string): Chat[] {
		return chatHistories[filePath] ?? [];
	}

	function addToChatHistory(filePath: string, content: Chat) {
		if (!chatHistories[filePath]) {
			chatHistories[filePath] = [];
		}
		chatHistories[filePath].push(content);
	}
	const client = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: RUN_IN_BROWSER_FOR_OBSIDIAN,
	});

	function generatePrompt(
		messages: ChatCompletionMessageParam[],
		options?: ModalCallOptions,
		json = false
	): ChatCompletionCreateParamsNonStreaming {
		const promptOptions = {...plugin.state.getSettings(), ...options};
		
		const prompt: ChatCompletionCreateParamsNonStreaming = {
			messages,
			model: promptOptions.openAIModel,
			stream: false,
			temperature: promptOptions.oaiTemperature ?? 0.5,
			max_tokens: promptOptions.oaiMaxTokens ?? 150,
			response_format: json ? { type: "json_object" } : undefined,
		};
		return prompt;
	}

	async function requestJSON(
		messages: ChatCompletionMessageParam[],
		options?: ModalCallOptions,
	): Promise<Record<string, any>> {
		try {
			const chatOptions = generatePrompt(messages, options, true);
			const response = await client.chat.completions.create(chatOptions);
			return response?.choices?.[0]?.message
				? JSON.parse(response.choices[0].message.content as string)
				: {};
		} catch (e: any) {
			console.error("Error in requestJSON:", e);
			return { error: e.message || DEFAULT_ERROR_MESSAGE };
		}
	}

	async function requestChat(
		messages: ChatCompletionMessageParam[],
		options?: ModalCallOptions,
	): Promise<string> {
		try {
			const chatOptions = generatePrompt(messages, options);
			const response = await client.chat.completions.create(chatOptions);
			return (response?.choices?.[0]?.message?.content as string) || "";
		} catch (e: any) {
			console.error("Error in requestChat:", e);
			return e.message || DEFAULT_ERROR_MESSAGE;
		}
	}

	return {
		client,
		requestChat,
		requestJSON,
		getChatHistory,
		addToChatHistory,
	};
}
