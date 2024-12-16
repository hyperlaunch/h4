export const jobTs = (name: string) => `import { H4BaseJob } from "@h4/jobs";

export default class ${name} extends H4BaseJob {
	filepath = import.meta.url;

	run = async () => {}
}`;
