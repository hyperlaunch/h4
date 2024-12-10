import { queueJob } from "@h4/queue/index";

export type JobProps =
	| string
	| number
	| boolean
	| null
	| { [key: string]: JobProps }
	| JobProps[];

export abstract class H4BaseJob<T extends JobProps = JobProps> {
	abstract filepath: string;
	props: T;

	constructor({ props }: { props: T }) {
		this.props = props;
	}

	queue() {
		return queueJob({
			filepath: this.filepath,
			props: this.props,
		});
	}

	abstract run: () => void;
}
