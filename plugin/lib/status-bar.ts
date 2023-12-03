/**
 * The Digital Gardener Status Bar instance in Obsidian, this allows
 * control over the content and display of thre status bar.
 */
export class DGStatusBar {

	/**
	 * The status bar element
	 */
	private statusBar: HTMLElement;

	/**
	 * 
	 * @param statusBar The status bar element
	 */
	constructor(statusBar: HTMLElement) {
		this.statusBar = statusBar;
	}

	/**
	 * Shows the status bar
	 */
	show() {
		this.statusBar.show();
	}

	/**
	 * Hides the status bar
	 */
	hide() {
		this.statusBar.hide();
	}

	/**
	 * Clears the status bar
	 */
	clear() {
		this.statusBar.empty();
	}

	/**
	 * Sets the content of the status bar
	 * @param content The content to set
	 */
	setContent(content: string) {
		this.statusBar.empty();
		this.statusBar.createEl("span", { text: content });
	}
}


export function createStatusBar(statusBar: HTMLElement) {
	return new DGStatusBar(statusBar);
}
