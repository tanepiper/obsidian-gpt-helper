import { ButtonComponent, Modal } from "obsidian";
import { DigitalGardener } from "../plugin/plugin.js";

export interface DGMessageModalOptions {
	title: string;
	message: string;
	acceptText?: string; // Custom text for the accept button
	closeText?: string;  // Custom text for the close button
}

/**
 * A simple message modal for use in Digital Gardener
 */
export class DGMessageModal extends Modal {

	/**
	 * The modal options
	 */
	options: DGMessageModalOptions;

	/**
	 * Method to run when the accept button is clicked
	 */
	onAccept?: () => Promise<void>;

	/**
	 * Method to run when the modal is closed
	 */
	onClosed?: () => Promise<void>;

	constructor(
		plugin: DigitalGardener,
		options: DGMessageModalOptions,
		onClosed?: () => Promise<void>,
		onAccept?: () => Promise<void>
	) {
		super(plugin.app);
		this.options = options;
		this.onAccept = onAccept;
		this.onClosed = onClosed;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: this.options.title });
		contentEl.createEl("p", { text: this.options.message });

		if (this.onAccept) {
			this.addAcceptButton();
		}

		const closeButton = new ButtonComponent(contentEl)
			.setButtonText(this.options.closeText || "Close")
			.onClick(async () => {
				try {
					if (this.onClosed) await this.onClosed();
				} catch (error) {
					console.error("Error on closing:", error);
				} finally {
					this.close();
				}
			});
	}

	/**
	 * Add the accept button to the modal
	 */
	addAcceptButton() {
		const { contentEl } = this;
		const acceptButton = new ButtonComponent(contentEl)
			.setButtonText(this.options.acceptText || "Accept")
			.onClick(async () => {
				try {
					if (this.onAccept) await this.onAccept();
				} catch (error) {
					console.error("Error on accept:", error);
				} finally {
					this.close();
				}
			});

		// Set focus on the accept button for better accessibility
		acceptButton.buttonEl.focus();
	}
}
