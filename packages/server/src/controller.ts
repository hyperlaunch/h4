import type { MatchedRoute, Server } from "bun";

export type H4ControllerAction = () =>
	| Promise<Response>
	| Response
	| ReturnType<H4BaseController["json"]>
	| ReturnType<H4BaseController["html"]>
	| ReturnType<H4BaseController["redirect"]>
	| Promise<ReturnType<H4BaseController["json"]>>
	| Promise<ReturnType<H4BaseController["html"]>>
	| Promise<ReturnType<H4BaseController["redirect"]>>;

export type H4MiddlewareHandler = () => void;

export abstract class H4BaseController {
	match: MatchedRoute;
	req: Request;
	server: Server;

	constructor({
		match,
		req,
		server,
	}: { match: MatchedRoute; req: Request; server: Server }) {
		this.match = match;
		this.req = req;
		this.server = server;
	}

	get?: H4ControllerAction;
	post?: H4ControllerAction;
	put?: H4ControllerAction;
	patch?: H4ControllerAction;
	delete?: H4ControllerAction;

	json<T>(data: T, { status = 200 } = {}) {
		return { type: "json", data, status, location: undefined, html: undefined };
	}

	html(html: string, { status = 200 } = {}) {
		return { type: "html", html, status, location: undefined, data: undefined };
	}

	redirect(location: string, { status = 302 } = {}) {
		return {
			type: "redirect",
			location,
			status,
			html: undefined,
			data: undefined,
		};
	}

	async compile(
		instance: { compile: () => string | Promise<string> },
		{ status = 200 } = {},
	) {
		return this.html(await instance.compile(), { status });
	}
}
