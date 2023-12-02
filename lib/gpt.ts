import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { DigitalGardenerSettings } from "./settings";
import { Chat } from "openai/resources";

export interface DGOpenAIClient {
    client: OpenAI;
	getChatHistory: (filePath: string) => Chat[];
	addToChatHistory: (filePath: string, content: Chat) => void;
    requestChat: (system: string, content: string, settings: DigitalGardenerSettings) => Promise<string>;
    requestJSON: (system: string, content: string, settings: DigitalGardenerSettings) => Promise<Record<string, any>>;
}

const RUN_IN_BROWSER_FOR_OBSIDIAN = true;
const DEFAULT_ERROR_MESSAGE = "My apologies, I am having trouble fetching a response from OpenAI. Please try again.";

/**
 * Create an internal OpenAI Client for interacting with the API for chats and JSON responses
 */
export function createOpenAIClient(apiKey: string): DGOpenAIClient {

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

	

    function generatePrompt(system: string, content: string, settings: DigitalGardenerSettings, json = false): ChatCompletionCreateParamsNonStreaming {
        const options: ChatCompletionCreateParamsNonStreaming = {
            messages: [{ role: "system", content: system }, { role: "user", content }],
            model: settings.openAIModel,
            stream: false,
            temperature: settings.oaiTemperature ?? 0.5,
            max_tokens: settings.oaiMaxTokens ?? 150,
            response_format: json ? { type: "json_object" } : undefined,
        };
        return options;
    }

    async function requestJSON(system: string, content: string, settings: DigitalGardenerSettings): Promise<Record<string, any>> {
        try {
            const chatOptions = generatePrompt(system, content, settings, true);
            const response = await client.chat.completions.create(chatOptions);
            return response?.choices?.[0]?.message
                ? JSON.parse(response.choices[0].message.content as string)
                : {};
        } catch (e: any) {
            console.error("Error in requestJSON:", e);
            return { error: e.message || DEFAULT_ERROR_MESSAGE };
        }
    }

    async function requestChat(system: string, content: string, settings: DigitalGardenerSettings): Promise<string> {
        try {
            const chatOptions = generatePrompt(system, content, settings);
            const response = await client.chat.completions.create(chatOptions);
            return response?.choices?.[0]?.message?.content as string || '';
        } catch (e: any) {
            console.error("Error in requestChat:", e);
            return e.message || DEFAULT_ERROR_MESSAGE;
        }
    }

    return { client, requestChat, requestJSON, getChatHistory, addToChatHistory };
}
