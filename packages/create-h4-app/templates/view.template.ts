export const viewTs = `import { H4BaseView } from "@h4-dev/views";
import BaseLayout from "./components/base-layout.tsx";

export default class IndexView extends H4BaseView {
	render = () => (
		<BaseLayout>
			<h1>Hello World!</h1>
		</BaseLayout>
	);
}`;
