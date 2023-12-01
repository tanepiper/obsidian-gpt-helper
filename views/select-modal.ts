import { ButtonComponent, Modal, Setting } from "obsidian";
import { DigitalGardener } from "../plugin/plugin.js";

export interface AgentOption {
    value: string;
    label: string;
	description: string;
    reason: string;
    score: number;
}

export interface DGSelectModalOptions {
    title: string;
    options: AgentOption[];
	instructions: string;
    type: "select" | "enable";
}

export class DGSelectModal extends Modal {
    plugin: DigitalGardener;
    options: DGSelectModalOptions;
    selectedOptions: Set<string> = new Set();

    onSubmit?: (selectedOptions: string[]) => Promise<void>;

    constructor(
        plugin: DigitalGardener,
        options: DGSelectModalOptions,
        onSubmit?: (selectedOptions: string[]) => Promise<void>
    ) {
        super(plugin.app);
        this.plugin = plugin;
        this.options = options;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: this.options.title });
		contentEl.createEl("p", { text: this.options.instructions });

        this.options.options.forEach((option, index) => {
            const setting = new Setting(contentEl)
                .setName(option.label)
				.setTooltip(`Confidence: ${option.score} - ${option.reason}`)
                .setDesc(`${option.description}`)
				

            if (this.options.type === "enable") {
                setting.addToggle(toggle => {
                    toggle.setValue(false).onChange(value => {
                        if (value) {
                            this.selectedOptions.add(option.value);
                        } else {
                            this.selectedOptions.delete(option.value);
                        }
                    });
                });
            } else if (this.options.type === "select") {
                setting.addButton(button => {
                    button.setButtonText("Select")
                        .onClick(async () => {
                            if (this.onSubmit) {
                                await this.onSubmit([option.value]);
                            }
                            this.close();
                        });
                    if (index === 0) {
                        button.buttonEl.focus();
                    }
                });
            }
        });

        if (this.options.type === "enable") {
            new ButtonComponent(contentEl)
                .setButtonText("Submit Selection")
                .setCta()
                .onClick(async () => {
                    if (this.onSubmit) {
                        await this.onSubmit(Array.from(this.selectedOptions));
                    }
                    this.close();
                });
        }

        new ButtonComponent(contentEl)
            .setButtonText("Close")
            .onClick(() => {
                this.close();
            });
    }
}
