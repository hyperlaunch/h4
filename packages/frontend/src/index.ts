import { watch } from "node:fs";
import buildFrontend from "./build";

export default function h4Frontend({
	frontendDir = `${process.cwd()}/src/frontend`,
	distDir = `${process.cwd()}/public/h4-dist`,
	entrypoints = ["./entry.ts", "./entry.css"],
	isProd = process.env.NODE_ENV === "production",
}: {
	frontendDir?: string;
	distDir?: string;
	entrypoints: string[];
	isProd?: boolean;
}) {
	return async () => {
		buildFrontend({ frontendDir, distDir, entrypoints, isProd });
		const watcher = watch(frontendDir, async () => {
			buildFrontend({ frontendDir, distDir, entrypoints, isProd });
		});

		process.on("SIGINT", () => {
			watcher.close();
			process.exit(0);
		});
	};
}
