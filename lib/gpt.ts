import OpenAI from "openai";

export interface DGOpenAIClient {
	/**
	 * Instance of the OpenAI Client
	 */
	client: OpenAI

	requestChat: (system: string, content: string, model: string) => Promise<string>
}

const RUN_IN_BROWSER_FOR_OBSIDIAN = true;

export function createOpenAIClient(apiKey: string): DGOpenAIClient {
	const client = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: RUN_IN_BROWSER_FOR_OBSIDIAN,
	});

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
			const response = await client.chat.completions.create({
				//tools: [{type: "function", function: }],
				messages: [
					{
						role: "system",
						content: system,
					},
					{ role: "user", content },
				],
				model,
				stream: false,
			});

			if (response?.choices?.[0]?.message) {
				result = response?.choices?.[0]?.message.content as string;
			}
		} catch (e) {
			console.error(e);
			result =
				`My apologies, I am having trouble fetching a response from OpenAI.  Please try again.`;
		}

		return result;
	}

	return {
		client,
		requestChat,
	};
}
