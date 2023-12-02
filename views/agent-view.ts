import DigitalGardener from "../main.js";
import {
	ButtonComponent,
	ItemView,
	Setting,
	TextAreaComponent,
	WorkspaceLeaf,
	addIcon,
} from "obsidian";

export const DG_CHAT_AGENT_VIEW = "dg-chat-agent";

export class DGChatAgentView extends ItemView {
	plugin: DigitalGardener;

	mainContainer: HTMLElement;

	chatArea: HTMLElement;

	chatHistory: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: DigitalGardener) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return DG_CHAT_AGENT_VIEW;
	}

	getDisplayText() {
		return "Digital Gardener";
	}

	// onOpen() {
	// 	console.log("Active file changed");
	// 	//this.displayChatHistoryForActiveFile();
	// }

	displayChatHistoryForActiveFile() {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile) {
			const history = this.plugin.openAI.getChatHistory(activeFile.path);
			//this.chatHistory.empty();
			history.forEach((message) => {
				//this.chatHistory.createEl("p", { text: message });
			});
		}
	}

	async onOpen() {
		const activeFile = this.app.workspace.getActiveFile();
		this.mainContainer = this.containerEl.children[1] as HTMLElement;
		this.mainContainer.empty();

		this.chatArea = this.mainContainer.createDiv("chat-area");
		this.chatArea.style.display = "flex";
		this.chatArea.style.flexDirection = "column";
		this.chatArea.style.justifyContent = "space-around";

		const textEl = new TextAreaComponent(this.chatArea)
			.setPlaceholder("Enter the query you want to send to the agent")
			.onChange((value) => {
				//this.options.userQuery = value;
			});
		textEl.inputEl.style.width = "100%";
		textEl.inputEl.style.minHeight = "100px";

		new ButtonComponent(this.chatArea)
			.setButtonText("Send")
			.onClick(async () => {
				const item = {
					role: "user",
					content: textEl.getValue(),
				};
				this.chatHistory.createEl("p", { text: 'User' });
				this.chatHistory.createEl("p", { text: item.content });
			});

		this.chatHistory = this.chatArea.createDiv("chat-history");

		// this.displayChatHistoryForActiveFile();

		// const container = this.containerEl.children[1];
		// container.empty();
		// container.createEl("h4", { text: "🧑🏼‍🌾 Chat Agent" });

		// const chatContainer = container.createDiv("chat-container");
		// chatContainer.style.display = "flex";
		// chatContainer.style.flexDirection = "column";
		// chatContainer.style.justifyContent = "space-around";

		// const textEl = new TextAreaComponent(chatContainer)
		// 	.setPlaceholder("Enter the query you want to send to the agent")
		// 	.onChange((value) => {
		// 		//this.options.userQuery = value;
		// 	});
		// textEl.inputEl.style.width = "100%";
		// textEl.inputEl.style.minHeight = "100px";

		// new ButtonComponent(chatContainer)
		// 	.setButtonText("Send")
		// 	.onClick(async () => {
		// 		//this.close();
		// 	});

		// this.chatHistory = container.createDiv("chat-history");

		// Create Tabs
		//const tabContainer = container.createDiv();
		//tabContainer.createEl("button", { text: "Current Request" }).onclick = () => this.showCurrentRequest();
		//tabContainer.createEl("button", { text: "Continuous Conversation" }).onclick = () => this.showContinuousConversation();
		// Default to showing current request
		//this.showCurrentRequest();
	}

	showCurrentRequest() {
		// Implementation to display current GPT request
	}

	showContinuousConversation() {
		// Implementation for continuous conversation UI
	}
}

// // Add to ribbon
// app.workspace.onLayoutReady(() => {
//     addIcon("gpt-icon", "<svg>...</svg>"); // Your SVG icon
//     app.workspace.leftRibbon.containerEl.createEl("button", {
//         cls: "gpt-ribbon-icon",
//         attr: { "aria-label": "Open GPT Interaction" }
//     }).onclick = () => {
//         app.workspace.getLeaf(true).setViewState({
//             type: "gpt-view",
//         });
//     };
// });
