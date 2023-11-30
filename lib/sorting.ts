import { Plugin } from "obsidian";

function removeIgnoredFolders(folders: string[]) {
	return folders.filter((folder) => {
		if (folder.includes(".obsidian")) return false;
		if (folder.includes(".git")) return false;
		if (folder.includes(".space")) return false;
		if (folder.includes(".trash")) return false;
		return true;
	});
}

async function recursiveFolderSearch(
	plugin: Plugin,
	startPath: string,
	allPaths: string[] = []
) {
	const filesAndFolders = await plugin.app.vault.adapter.list(startPath);
	const list = removeIgnoredFolders(filesAndFolders?.folders ?? []);
	allPaths.push(...list);
	await recursiveFolderSearch(plugin, startPath, allPaths);
}

/**
 * Takes an application and returns a sorted list of all folders in the vault,
 * removing any dot folders and other ignore list items
 * @returns Return a sorted list of all folders in the vault
 */
export async function getSortedVaultFolders(plugin: Plugin): Promise<[string, string][]> {
	// Get the root first so we can ignore any .dot folders
	const rootPath = plugin.app.vault.getRoot().path;
	let vaultFolders = await this.app.vault.adapter.list(rootPath)?.folders ?? [];
	vaultFolders = removeIgnoredFolders(vaultFolders)
	// Recursively search the folders
	await recursiveFolderSearch(plugin, rootPath, vaultFolders);
	vaultFolders.sort();
	return vaultFolders.map((folder: string) => [folder, folder]);
}


