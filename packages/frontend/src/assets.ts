import { basename, extname, join } from "node:path";
import { Glob } from "bun";

export function assetUrl(
	assetName: string,
	{
		distDir = `${process.cwd()}/public/h4-dist`,
	}: {
		distDir?: string;
	} = {},
): string {
	const assetBaseName = basename(assetName, extname(assetName));
	const targetExtension =
		extname(assetName) === ".ts" ? ".js" : extname(assetName);

	const pattern = `${assetBaseName}*${targetExtension}`;
	const glob = new Glob(pattern);

	try {
		const matches = [...glob.scanSync(distDir)];

		if (matches.length > 0) {
			const matchedFile = matches[0];
			const relativePath = matchedFile.replace(distDir, "").replace(/\\/g, "/");
			// TODO: Don't hardcode /h4-dist/
			return `/h4-dist/${relativePath}`;
		}

		throw new Error(`Asset not found: ${assetName}`);
	} catch (err) {
		console.error(`Error resolving asset URL for ${assetName}:`, err);
		throw err;
	}
}
