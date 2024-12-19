import { contentToString } from "@kitajs/html";

export abstract class H4BaseView<T = undefined> {
	props: T;

	abstract render: () => JSX.Element;

	// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
	constructor(props: T extends undefined ? void : T) {
		this.props = props as T;
	}

	compile = () => contentToString(this.render());
}
