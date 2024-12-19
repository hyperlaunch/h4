import { renderToStream } from "@kitajs/html/suspense";

export abstract class H4BaseView<T = undefined> {
	props: T;

	abstract render: () => JSX.Element;

	constructor({ props }: { props: T }) {
		this.props = props;
	}

	compile = () => renderToStream(this.render());
}
