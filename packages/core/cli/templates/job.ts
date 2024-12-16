export const jobTs = (
	name: string,
) => `import { H4BaseJob } from "@h4-dev/jobs";

export default class ${name} extends H4BaseJob {
	filepath = import.meta.url;

	run = async () => {}
}`;
