import { App, TFile, TFolder } from "obsidian";

/**
 * Handler for working with files and folders in an Obsidian vault.
 */
export class DGVaultFileHandler {
	/**
	 * The App that contains the file vault
	 */
	private app: App;

	/**
	 * The root folder of the vault
	 */
	private vaultRoot: TFolder;

	/**
	 * The root folder of the Obsidian config
	 */
	private obsidianConfigRoot: string;
	
	/**
	 * The plugin folder in the vault
	 */
	rootFolder: string;

	/**
	 * Constructs a file handler for an Obsidian plugin.
	 * @param app The main application instance.
	 * @param rootFolder The root folder the plugin will use to store files, this should be relative to the vault root.
	 */
	constructor(app: App, rootFolder = "digital-gardener") {
		this.app = app;
		this.rootFolder = rootFolder;
		this.vaultRoot = app.vault.getRoot();
		this.obsidianConfigRoot = app.vault.configDir;
	}

	/**
	 * Returns if a path within the vault exists
	 * @param path Path within the vault to check for
	 * @returns
	 */
	fileOrFolderExists(path: string): boolean {
		return Boolean(app.vault.getAbstractFileByPath(path));
	}

	/**
	 * Returns if a path within the vault is a file
	 * @param path Path within the vault to check for
	 * @returns
	 */
	isFile(path: string): boolean {
		const file = this.app.vault.getAbstractFileByPath(path);
		return Boolean(file && file instanceof TFile);
	}

	/**
	 * Returns if a path within the vault is a folder
	 * @param path Path within the vault to check for
	 * @returns
	 */
	isFolder(path: string): boolean {
		const file = this.app.vault.getAbstractFileByPath(path);
		return Boolean(file && file instanceof TFolder);
	}

	/**
	 * Create a folder within the vault
	 * @param path
	 */
	async createFolder(path: string): Promise<void> {
		await this.app.vault.createFolder(path);
	}

	/**
	 * Create a file within the vault
	 * @param path
	 * @param content
	 */
	async createFile(path: string, content: string): Promise<TFile> {
		return await this.app.vault.create(path, content);
	}

	/**
	 * Append a file with content
	 * @param file
	 * @param content
	 */
	async appendFile(file: TFile, content: string): Promise<void> {
		try {
			await app.vault.append(file, "\n" + content);
		} catch (error) {
			console.error("Error appending content to the file:", error);
		}
	}

	/**
	 * Checks whether the plugin's root folder exists in the vault.
	 * Logs the check process and result to the console.
	 * @returns A promise resolving to a boolean indicating existence.
	 */
	async rootFolderExists(): Promise<boolean> {
		return this.fileOrFolderExists(this.rootFolder);
	}

	/**
	 * Recursively searches for folders starting from a given path.
	 * Ignores certain system-related directories like .obsidian, .git, etc.
	 * @param path The starting path for the search.
	 * @param folderList An array to accumulate the found folders.
	 * @returns A promise resolving to an array of folder paths.
	 */
	async recursiveFolderSearch(
		path: string,
		folderList: string[] = []
	): Promise<string[]> {
		const list = await this.app.vault.adapter.list(path);
		const folders = (list?.folders ?? []).filter(
			(folder) =>
				![".obsidian", ".git", ".space", ".trash"].some((excluded) =>
					folder.includes(excluded)
				)
		);

		for (const folder of folders) {
			folderList.push(folder);
			await this.recursiveFolderSearch(folder, folderList);
		}
		return folderList;
	}

	/**
	 * Get a list of all folders in the vault, sorted alphabetically.
	 * @returns A promise resolving to an array of folder paths.
	 */
	async getSortedFolderList(): Promise<[string, string][]> {
		const rootPath = this.app.vault.getRoot().path;
		const allFolders: string[] = [];
		await this.recursiveFolderSearch(rootPath, allFolders);
		allFolders.sort();
		return allFolders.map((folder: string) => [folder, folder]);
	}
}

/**
 * Create a PluginFileHandler instance.
 * @param app The Obsidian App instance.
 * @param rootFolder The root folder the plugin will use to store files, this should be relative to the vault root.
 * @returns An instance of PluginFileHandler.
 */
export function createPluginFileHandler(
	app: App,
	rootFolder = "digital-gardener"
) {
	return new DGVaultFileHandler(app, rootFolder);
}
