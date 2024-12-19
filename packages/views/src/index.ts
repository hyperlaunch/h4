import { contentToString } from "@kitajs/html";

export abstract class H4BaseView<T = undefined> {
	props: T;

	abstract render: () => JSX.Element;

	constructor(args: { props: T }) {
		this.props = args?.props;
	}

	compile = () => contentToString(this.render());
}
