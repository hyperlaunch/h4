import type { Database } from "bun:sqlite";

export type H4Config = {
	queueDb: Database;
	primaryDb: Database;
};

export async function loadConfig({
	configPath = `${import.meta.env.H4_ROOT}/h4.config.ts`,
} = {}) {
	const { config }: { config: H4Config } = await import(configPath);
	return config;
}
