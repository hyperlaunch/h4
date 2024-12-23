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
							const handler: H4ControllerAction = controllerInstance[method];

							const result = await handler();

							if (result instanceof Response) {
								logRequest(req, result.status);
								return result;
							}

							switch (result.type) {
								case "json":
									logRequest(req, result.status);
									return Response.json(result.data, { status: result.status });
								case "redirect":
									logRequest(req, result.status);
									return Response.redirect(
										String(result.location),
										result.status,
									);
								case "html":
									logRequest(req, result.status);
									return new Response(result.html, {
										status: result.status,
										headers: { "Content-Type": "text/html; charset=utf-8" },
									});
								case "plain":
									logRequest(req, result.status);
									return new Response(result.text, {
										status: result.status,
										headers: { "Content-Type": "text/plain; charset=utf-8" },
									});
								default:
									logRequest(req, 500);
									return new Response("Invalid response type", { status: 500 });
							}
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
