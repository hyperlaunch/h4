export const controllerTs = `import { H4BaseController } from "@h4-dev/server/controller";

export default class IndexController extends H4BaseController {
	get = async () => {
		return Response.json({ hello: "world" });
	};
}`;
