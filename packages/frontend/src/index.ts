import log from "@h4-dev/core/logger";
import { build } from "bun";

export default function h4Frontend({
	frontendDir = `${process.cwd()}/src/frontend`,
	distDir = `${process.cwd()}/public/h4-dist`,
	entrypoints = ["./entry.ts", "./entry.css"],
}: {
	frontendDir?: string;
	distDir?: string;
	entrypoints: string[];
}) {
	const isDev = process.env.NODE_ENV !== "production";

	return async () => {
		const buildOptions = {
			entrypoints: entrypoints.map((entry) => `${frontendDir}/${entry}`),
			outdir: distDir,
			minify: !isDev,
			experimentalCss: true,
		};

		if (isDev) {
			log({
				type: "INFO",
				message: "Running frontend in development mode...",
				color: "cyan",
			});

			const result = await build({
				...buildOptions,
				sourcemap: "inline",
				naming: "[name].[ext]",
			});

			if (result.success) {
				log({
					type: "INFO",
					message: `Frontend built successfully to ${distDir}`,
					color: "green",
				});
			} else {
				log({
					type: "ERROR",
					message: "Frontend build failed!",
					color: "red",
				});
				console.error(result.logs);
			}
		} else {
			log({
				type: "INFO",
				message: "Building frontend for production...",
				color: "cyan",
			});

			const result = await build({
				...buildOptions,
				sourcemap: "linked",
				naming: "[name]-[hash].[ext]",
			});

			if (result.success) {
				log({
					type: "INFO",
					message: `Frontend built successfully to ${distDir}`,
					color: "green",
				});
			} else {
				log({
					type: "ERROR",
					message: "Frontend build failed!",
					color: "red",
				});
				console.error(result.logs);
			}
		}
	};
}
