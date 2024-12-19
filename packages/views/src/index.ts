import { contentToString } from "@kitajs/html";

export abstract class H4BaseView<T = undefined> {
	props: T;

	abstract render: () => JSX.Element;

	constructor(
		args?: T extends undefined ? { props?: undefined } : { props: T },
	) {
		this.props = (args?.props as T) ?? (undefined as T);
	}

	compile = () => contentToString(this.render());
}
