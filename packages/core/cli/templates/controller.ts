export const controllerTs = (
	name: string,
) => `import { H4BaseController } from "@h4-dev/server/controller";

export default class ${name} extends H4BaseController {
	get = async () => {
		return Response.json({ hello: "world" });
	};
}`;
