export const componentTs = (
	name: string,
	propsType?: string,
) => `import { H4BaseView } from "@h4-dev/views";

export default function ${name}Component(${propsType ? `props: ${propsType}` : ""}) {
	return <></>
}`;
