import { queueJob } from "@h4-dev/queue/index";

export type JobProps =
	| string
	| number
	| boolean
	| null
	| { [key: string]: JobProps }
	| JobProps[]
	| undefined;

export abstract class H4BaseJob<T extends JobProps = undefined> {
	abstract filepath: string;
	props: T;

	// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
	constructor(props: T extends undefined ? void : T) {
		this.props = (props as T) ?? (undefined as T);
	}

	queue() {
		return queueJob({
			filepath: this.filepath,
			props: this.props,
		});
	}

	abstract run: () => void;
}
