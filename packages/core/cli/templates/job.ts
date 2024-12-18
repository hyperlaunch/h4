export const jobTs = (
	name: string,
	propsType?: string,
) => `import { H4BaseJob } from "@h4-dev/jobs";

export default class ${name}Job extends H4BaseJob${propsType ? `<${propsType}>` : ""} {
	filepath = import.meta.url;

	run = async () => {}
}`;
