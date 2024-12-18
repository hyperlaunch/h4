export const modelTs = (
	name: string,
	tableName: string,
	fields: string,
) => `import { H4BaseModel } from "@h4-dev/models";
import { H4Repository } from "@h4-dev/models/repository";

export default class ${name}Model extends H4BaseModel {
	${fields}
}
	
export const ${name}Repository = new H4Repository({
	table: "${tableName}",
	model: ${name}Model,
	${fields.includes("id!:") ? "useUuid: true," : ""}
});`;
