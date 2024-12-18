import log from "@h4-dev/core/logger";
import { FileSystemRouter, type Server, serve } from "bun";
import type { H4BaseController, H4ControllerAction } from "./controller";

function logRequest(req: Request, status: number) {
	const color = status >= 500 ? "red" : status >= 400 ? "yellow" : "green";

	log({
		type: "REQUEST",
		message: `${req.method} ${req.url} ${status}`,
		color,
	});
}

export default function h4Server({
	controllersDir,
	port = Number(process.env.PORT || 3000),
	middleware,
}: {
	controllersDir: string;
	port?: number;
	middleware?: (args: { req: Request; server: Server }) => void;
}) {
	return async () => {
		const router = new FileSystemRouter({
			style: "nextjs",
			dir: controllersDir,
		});

		const publicDir = `${process.cwd()}/public`;

		serve({
			port,
			fetch: async (req, server) => {
				const staticFileName = new URL(req.url).pathname.replace(/^\//, "");
				const staticFilePath = Bun.pathToFileURL(
					`${publicDir}/${staticFileName}`,
				);
				const staticFile = Bun.file(staticFilePath);

				if (await staticFile.exists()) {
					logRequest(req, 200);
					return new Response(staticFile);
				}

				if (middleware) await middleware({ req, server });

				const match = router.match(req);

				if (match) {
					const { filePath } = match;

					try {
						const Controller = (await import(filePath)).default;
						const controllerInstance: H4BaseController = new Controller({
							match,
							req,
							server,
						});

						const method = req.method.toLowerCase() as
							| "get"
							| "post"
							| "put"
							| "patch"
							| "delete";

						if (typeof controllerInstance[method] === "function") {
							const handler = controllerInstance[method] as H4ControllerAction;

							const response = await handler();
							logRequest(req, response.status);
							return response;
						}

						logRequest(req, 405);
						return new Response("Method Not Allowed", { status: 405 });
					} catch (err) {
						log({
							type: "ERROR",
							message: `Error loading controller: ${filePath}. ${JSON.stringify(err)}`,
							color: "red",
						});
						console.error(err);
						logRequest(req, 500);
						return new Response("Internal Server Error", { status: 500 });
					}
				}

				logRequest(req, 404);
				return new Response("Not Found", { status: 404 });
			},
		});

		log({
			type: "INFO",
			message: `Server running: http://localhost:${port}`,
			color: "cyan",
		});
	};
}
