import { readdirSync } from "node:fs";
import { extname } from "node:path";

export function assetUrl({
	distDir,
	assetName,
}: {
	distDir: string; // Directory where assets are built
	assetName: string; // Original asset name (e.g., "main.ts" or "main.css")
}): string {
	const assetBaseName = assetName.replace(extname(assetName), ""); // Remove extension
	const extension = extname(assetName); // Get the extension (e.g., ".ts", ".css")

	try {
		const files = readdirSync(distDir); // Read all files in the output directory

		// Look for a file matching the base name and extension
		const matchedFile = files.find((file) => {
			const fileBaseName = file.split("-")[0]; // Extract base name before hash
			const fileExtension = extname(file); // Extract file extension
			return fileBaseName === assetBaseName && fileExtension === extension;
		});

		if (matchedFile) {
			return `/h4-dist/${matchedFile}`; // Return the relative path to the file
		}

		throw new Error(`Asset not found: ${assetName}`);
	} catch (err) {
		console.error(`Error resolving asset URL for ${assetName}:`, err);
		throw err;
	}
}
