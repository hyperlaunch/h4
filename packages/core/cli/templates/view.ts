export const viewTs = (
	name: string,
	propsType?: string,
) => `import { H4BaseView } from "@h4-dev/views";

export default class ${name}View extends H4BaseView${propsType ? `<${propsType}>` : ""} {
	render = () => <div />
}`;
