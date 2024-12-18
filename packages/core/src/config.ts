import type { Database } from "bun:sqlite";

export type H4Config = {
	queueDb: Database;
	primaryDb: Database;
};

export async function loadConfig({
	configPath = Bun.resolveSync("./h4.config.ts", process.cwd()),
} = {}) {
	const { config }: { config: H4Config } = await import(configPath);
	return config;
}
