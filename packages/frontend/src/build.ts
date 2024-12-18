import log from "@h4-dev/core/logger";
import { build } from "bun";

export default async function buildFrontend({
	frontendDir,
	distDir,
	entrypoints,
	isProd,
}: {
	frontendDir: string;
	distDir: string;
	entrypoints: string[];
	isProd: boolean;
}) {
	const buildOptions = {
		entrypoints: entrypoints.map((entry) => `${frontendDir}/${entry}`),
		outdir: distDir,
		minify: isProd,
		experimentalCss: true,
	};

	if (isProd) {
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
	} else {
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
	}
}
