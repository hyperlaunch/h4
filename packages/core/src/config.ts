import type { Database } from "bun:sqlite";

export type H4Config = {
	queueDb: Database;
	primaryDb: Database;
};

export async function loadConfig({
	fileName = "h4.config.ts",
	dir = new URL(".", `file://${Bun.main}`).pathname,
} = {}) {
	const configPath = new URL(fileName, `file://${dir}`).href;

	const { config }: { config: H4Config } = await import(configPath);
	return config;
}
