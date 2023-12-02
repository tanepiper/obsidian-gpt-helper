import { Notice } from 'obsidian';

/**
 * A simple notification manager for the plugin
 */
class NotificationManager {

	/**
	 * Show an error notification
	 * @param message 
	 * @param duration 
	 */
    static showError(message: string, duration?: number): void {
        new Notice(`🚨 Error:\n\n${message}`, duration);
    }

	/**
	 * 
	 * @param message 
	 * @param duration 
	 */
    static showInfo(message: string,  duration?: number): void {
        new Notice(`🧑🏼‍🌾 Info:\n\n ${message}`, duration);
    }
	

    // Other notification types like warnings, success, etc.
}
