export const viewControllerTs = `import { H4BaseController } from "@h4-dev/server/controller";
import IndexView from "../views/index.tsx";

export default class IndexController extends H4BaseController {
	get = async () => {
		const view = new IndexView();
		return this.compile(view);
	};
}`;
