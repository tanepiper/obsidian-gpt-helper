import { type DigitalGardenerSettings } from "../lib/settings.js";
import { DigitalGardener } from "./plugin.js";

/**
 * The Digital Gardener state manager
 */
export class DGStateManager {
	private plugin: DigitalGardener;
	private _settings: DigitalGardenerSettings;

	constructor(
		plugin: DigitalGardener,
		defaultSettings: DigitalGardenerSettings
	) {
		this.plugin = plugin;
		this._settings = defaultSettings;
	}

	get settings(): DigitalGardenerSettings {
		return this._settings;
	}

	/**
	 * Load the settings data from the plugin folder for the current user
	 */
	async load(): Promise<void> {
		const pluginSettings = await this.plugin.loadData();
		this._settings = { ...this._settings, ...pluginSettings };
	}

	/**
	 * Save the settings data to the plugin folder for the current user
	 */
	async saveSettings() {
		await this.plugin.saveData(this._settings);
	}

	/**
	 * Get the current settings
	 * @returns
	 */
	getSettings(): DigitalGardenerSettings {
		return this._settings;
	}

	/**
	 * Update the settings
	 * @param newSettings
	 */
	updateSettings(newSettings: DigitalGardenerSettings): void {
		this._settings = { ...this._settings, ...newSettings };
	}
}
