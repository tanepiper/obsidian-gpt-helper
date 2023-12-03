import { DGVaultFileHandler } from "./file-handler.js";

/**
 *
 * @param app
 * @param pluginDir
 * @returns
 */
export function createInstaller(fHandler: DGVaultFileHandler) {
	/**
	 *
	 * @param keys
	 */
	async function createConfigFolders(keys: string[]) {
		if (!fHandler.fileOrFolderExists(fHandler.rootFolder)) {
			await fHandler.createFolder(fHandler.rootFolder);
		}

		for (const key of keys) {
			const folderPath = `${fHandler.rootFolder}/${key}`;

			if (!fHandler.fileOrFolderExists(folderPath)) {
				await fHandler.createFolder(folderPath);
				console.log(`Configuration folder created: ${folderPath}`);
			} else {
				console.log(
					`Configuration folder already exists, skipped creation: ${folderPath}`
				);
			}
		}
	}

	return {
		createConfigFolders,
	};
}
