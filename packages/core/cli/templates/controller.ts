export const controllerTs = ({
	name,
	path,
}: {
	name: string;
	path: string;
}) => `import { H4BaseController } from "@h4-dev/server/controller";

export default class ${name}Controller extends H4BaseController {
	get = async () => {
		return this.plain("You can edit \`${name}Controller\` at ${path}");
	};
}`;
