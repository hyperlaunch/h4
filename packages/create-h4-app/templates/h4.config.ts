export const h4Config = `import { Database } from "bun:sqlite";
import type { H4Config } from "@h4/core/config";

export const config: H4Config = {
	queueDb: new Database("./storage/queue.db"),
	primaryDb: new Database("./storage/primary.db"),
};`;
