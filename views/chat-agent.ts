import DigitalGardener from "../main.js";
import {
	ItemView,
	WorkspaceLeaf,
	MarkdownView,
	Setting,
	TextAreaComponent,
	ButtonComponent,
} from "obsidian";
import { BehaviorSubject } from "rxjs";

interface ChatMessage {
	role: "user" | "agent";
	content: string;
}

export const DG_CHAT_AGENT_VIEW_TYPE = "dg-chat-agent-view";

const chatMessages = new BehaviorSubject<ChatMessage[]>([]);
let markdownContents: string[] = []; // Store for Markdown content

export default class ChatView extends ItemView {
	private viewHeader: HTMLElement;
	private mainContainer: HTMLElement;
	private chatSettingsArea: HTMLElement;

	private includeOpenFiles = false;

	private currentFileCount = 0;
	private currentContentLength = 0;

	constructor(leaf: WorkspaceLeaf, plugin: DigitalGardener) {
		super(leaf);
	}

	getViewType(): string {
		return DG_CHAT_AGENT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Digital Gardener Agent";
	}

	async onOpen() {
		this.viewHeader = this.containerEl.children[0] as HTMLElement;

		this.mainContainer = this.containerEl.children[1] as HTMLElement;
		this.mainContainer.empty();
		this.mainContainer.createEl("h6", { text: "Digital Gardener Agent" });
		//this.mainContainer.show();

		/**
		 * Below the chat area
		 */
		const textInput = new TextAreaComponent(this.containerEl)
			.setPlaceholder("Type a message...")
			.onChange(async (value) => {
				// Handle message input
			});
		textInput.inputEl.style.height = "100px";
		new ButtonComponent(this.containerEl)
			.setButtonText("Send")
			.onClick(async () => {
				// Handle send button
			});
		new Setting(this.containerEl)
			.setName("Chat with open Markdown files")
			.addToggle((toggle) =>
				toggle
					.setValue(this.includeOpenFiles)
					.onChange(async (value) => {
						this.includeOpenFiles = value;
						this.updateViewMode();
					})
			);

		const infoPanel = this.containerEl.createDiv("info-panel");
		infoPanel.style.display = "flex";
		infoPanel.style.justifyContent = "space-around";
		infoPanel.style.alignItems = "center";
		infoPanel.style.minHeight = "60px";
		infoPanel.style.marginBottom = "10px";
		infoPanel.createSpan({ text: `📑 ` });
		infoPanel.createSpan({ text: `🔤 ` });

		chatMessages.subscribe((messages) => {
			this.renderChat(messages);
		});

		this.updateViewMode();
	}

	private updateViewMode() {
		if (this.includeOpenFiles) {
			this.fetchMarkdownContent();
		}
		this.updateMarkdownInfo();
	}

	private fetchMarkdownContent() {
		markdownContents = this.app.workspace
			.getLeavesOfType("markdown")
			.map((leaf) => leaf.view)
			.filter((view) => view instanceof MarkdownView)
			.map((view: MarkdownView) => view.getViewData());
		this.updateMarkdownInfo();
	}

	private updateMarkdownInfo() {
		this.currentFileCount = markdownContents.length;
		this.currentContentLength = markdownContents.reduce(
			(acc, content) => acc + content.length,
			0
		);
	}

	private handleChatButtonClick() {
		if (this.includeOpenFiles) {
			// Use markdownContents as needed
		}
		// Other chat button logic
	}

	private renderChat(messages: ChatMessage[]) {
		// this.messagesContainer.empty();
		// messages.forEach((message) => {
		// 	this.messagesContainer.createEl("div", {
		// 		text: message.content,
		// 		cls: ["chat-message", message.role],
		// 	});
		// });
	}

	async onClose() {
		chatMessages.unsubscribe();
	}
}
