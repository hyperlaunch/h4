export const h4Config = ({
	skipQueue,
}: { skipQueue: boolean }) => `import { Database } from "bun:sqlite";
import type { H4Config } from "@h4-dev/core/config";

export const config: H4Config = {
	${skipQueue ? "" : `queueDb: new Database("./storage/queue.db"),`}
	primaryDb: new Database("./storage/primary.db"),
};`;
