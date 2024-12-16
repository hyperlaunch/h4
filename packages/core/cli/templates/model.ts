export const modelTs = (
	name: string,
	tableName: string,
	fields: string,
) => `import { H4BaseModel, H4Repository } from "@h4-dev/models";

export default class ${name} extends H4BaseModel {
	${fields}
}
	
export const ${name}Repository = new H4Repository("${tableName}", ${name});`;
