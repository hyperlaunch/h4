import type { MatchedRoute, Server } from "bun";

export type H4ControllerAction = () => Promise<Response> | Response;

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
}
