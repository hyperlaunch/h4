#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { write } from "bun";
import { componentTs } from "./templates/component";
import { controllerTs } from "./templates/controller";
import { jobTs } from "./templates/job";
import { modelTs } from "./templates/model";
import { viewTs } from "./templates/view"; // Assuming a template for views

const USAGE = `
Usage:
  h4 create controller <path/to/controller>
  h4 create model <model-name> [field:type ...]
  h4 create job <job-name> [prop:type ...]
  h4 create view <view-name> [prop:type ...]
`;

const COLOR = {
	blue: (str: string) => `\x1b[34m${str}\x1b[0m`,
	green: (str: string) => `\x1b[32m${str}\x1b[0m`,
	red: (str: string) => `\x1b[31m${str}\x1b[0m`,
};

const BASE_PATHS = {
	controller: "src/controllers",
	model: "src/models",
	job: "src/jobs",
	view: "src/views",
	component: "src/views/components",
	migrate: "db/migrations",
};

const TYPE_MAPPING_SQLITE: Record<string, string> = {
	string: "text",
	number: "integer",
	boolean: "boolean",
	Date: "datetime",
	Buffer: "blob",
	bigint: "bigint",
};

const TYPE_MAPPING_TS: Record<string, string> = {
	string: "string",
	number: "number",
	boolean: "boolean",
	Date: "Date",
	Buffer: "Buffer",
	bigint: "bigint",
};

async function createFile(filePath: string, content: string) {
	const resolvedPath = resolve(filePath);
	const dirPath = dirname(resolvedPath);

	await mkdir(dirPath, { recursive: true });

	if (await Bun.file(resolvedPath).exists()) {
		console.error(COLOR.red(`Error: File already exists at ${resolvedPath}`));
		process.exit(1);
	}

	await write(resolvedPath, content);
	console.log(COLOR.green(`Created: ${resolvedPath}`));
}

async function createController(path: string) {
	const dirPath = resolve(BASE_PATHS.controller, path);
	const controllerName = formatToClassName(basename(path));

	await mkdir(dirPath, { recursive: true });

	const filePath = resolve(dirPath, "index.ts");
	if (await Bun.file(filePath).exists()) {
		console.error(COLOR.red(`Error: Controller already exists at ${filePath}`));
		process.exit(1);
	}

	const content = controllerTs(controllerName);
	await createFile(filePath, content);
}

async function createModel(name: string, fields: string[]) {
	const parsedFieldsSQL = fields.map((field) => {
		const parts = field.split(":");
		if (parts.length < 2) {
			console.error(
				COLOR.red(
					`Error: Invalid field definition "${field}". Use name:type[:pk][:unique][:optional]`,
				),
			);
			process.exit(1);
		}

		const fieldName = parts[0];
		const fieldType = parts[1];
		const isPrimaryKey = parts.includes("pk");
		const isUnique = parts.includes("unique");
		const isoptional = parts.includes("optional");
		const sqlType = TYPE_MAPPING_SQLITE[fieldType];

		if (!sqlType) {
			console.error(COLOR.red(`Error: Unsupported type "${fieldType}"`));
			process.exit(1);
		}

		if (isPrimaryKey && isUnique) {
			console.error(
				COLOR.red(
					`Error: Field "${fieldName}" cannot be both PRIMARY KEY and UNIQUE.`,
				),
			);
			process.exit(1);
		}

		const constraints = [];
		if (isPrimaryKey) constraints.push("PRIMARY KEY");
		if (isUnique) constraints.push("UNIQUE");
		if (!isoptional && !isPrimaryKey) constraints.push("NOT NULL");

		return `  ${fieldName} ${sqlType} ${constraints.join(" ").trim()}`.trim();
	});

	const parsedFieldsTS = fields.map((field) => {
		const parts = field.split(":");
		if (parts.length < 2) {
			console.error(
				COLOR.red(
					`Error: Invalid field definition "${field}". Use name:type[:pk][:unique][:optional]`,
				),
			);
			process.exit(1);
		}
		const fieldName = parts[0];
		const fieldType = TYPE_MAPPING_TS[parts[1]];
		const isoptional = parts.includes("optional");

		if (!fieldType) {
			console.error(COLOR.red(`Error: Unsupported type "${parts[1]}"`));
			process.exit(1);
		}

		return isoptional
			? `${fieldName}?: ${fieldType};`
			: `${fieldName}!: ${fieldType};`;
	});

	const tsFields = parsedFieldsTS.join("\n\t");

	const modelFilePath = resolve(
		BASE_PATHS.model,
		`${formatToFileName(name)}.ts`,
	);
	const modelContent = modelTs(
		formatToClassName(name),
		formatToTableName(name),
		tsFields,
	);
	await createFile(modelFilePath, modelContent);

	const timestamp = getCurrentTimestamp();
	const migrationFilePath = resolve(
		BASE_PATHS.migrate,
		`${timestamp}_create_${formatToFileName(name)}.sql`,
	);
	const migrationContent = `-- migrate:up
CREATE TABLE ${formatToTableName(name)} (
${parsedFieldsSQL.join(",\n")}
);

-- migrate:down
DROP TABLE ${formatToTableName(name)};`;

	await createFile(migrationFilePath, migrationContent);
}

async function createJob(name: string, fields: string[]) {
	const ALLOWED_TYPES = ["string", "number", "boolean"];

	const parsedFieldsTS = fields.map((field) => {
		const parts = field.split(":");
		if (parts.length < 2) {
			console.error(
				COLOR.red(
					`Error: Invalid field definition "${field}". Use name:type[:optional]`,
				),
			);
			process.exit(1);
		}

		const fieldName = parts[0];
		const fieldType = parts[1];
		const isOptional = parts.includes("optional");

		if (!ALLOWED_TYPES.includes(fieldType)) {
			console.error(
				COLOR.red(
					`Error: Unsupported type "${fieldType}". Allowed types: ${ALLOWED_TYPES.join(", ")}`,
				),
			);
			process.exit(1);
		}

		return isOptional
			? `${fieldName}?: ${fieldType};`
			: `${fieldName}: ${fieldType};`;
	});

	const propsType =
		parsedFieldsTS.length > 0
			? `{
		${parsedFieldsTS.join("\n\t")}
	}`
			: undefined;

	const jobFilePath = resolve(BASE_PATHS.job, `${formatToFileName(name)}.ts`);
	const jobContent = jobTs(formatToClassName(name), propsType);
	await createFile(jobFilePath, jobContent);
}

async function createView(name: string, fields: string[]) {
	const parsedFieldsTS = fields.map((field) => {
		const parts = field.split(":");
		if (parts.length < 2) {
			console.error(
				COLOR.red(
					`Error: Invalid field definition "${field}". Use name:type[:optional]`,
				),
			);
			process.exit(1);
		}

		const fieldName = parts[0];
		const fieldType = parts[1];
		const isOptional = parts.includes("optional");

		return isOptional
			? `${fieldName}?: ${fieldType};`
			: `${fieldName}: ${fieldType};`;
	});

	const propsType =
		parsedFieldsTS.length > 0
			? `{
		${parsedFieldsTS.join("\n\t")}
	}`
			: undefined;

	const viewFilePath = resolve(BASE_PATHS.view, `${formatToFileName(name)}.ts`);
	const viewContent = viewTs(formatToClassName(name), propsType);
	await createFile(viewFilePath, viewContent);
}

async function createComponent(name: string, fields: string[]) {
	const parsedFieldsTS = fields.map((field) => {
		const parts = field.split(":");
		if (parts.length < 2) {
			console.error(
				COLOR.red(
					`Error: Invalid field definition "${field}". Use name:type[:optional]`,
				),
			);
			process.exit(1);
		}

		const fieldName = parts[0];
		const fieldType = parts[1];
		const isOptional = parts.includes("optional");

		return isOptional
			? `${fieldName}?: ${fieldType};`
			: `${fieldName}: ${fieldType};`;
	});

	const propsType =
		parsedFieldsTS.length > 0
			? `{
		${parsedFieldsTS.join("\n\t")}
	}`
			: undefined;

	const componentFilePath = resolve(
		BASE_PATHS.component,
		`${formatToFileName(name)}.tsx`,
	);
	const componentContent = componentTs(formatToClassName(name), propsType);
	await createFile(componentFilePath, componentContent);
}

function formatToClassName(input: string) {
	return input
		.replace(/[-_]+/g, " ")
		.replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
		.replace(/\s+/g, "");
}

function formatToFileName(input: string) {
	return input.replace(/[-_]+/g, "-").toLowerCase();
}

function formatToTableName(input: string) {
	return input.replace(/[-_]+/g, "_").toLowerCase();
}

function basename(path: string) {
	return String(path.split("/").pop());
}

function getCurrentTimestamp() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");
	return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

const [command, ...args] = Bun.argv.slice(2);

if (!command) {
	console.log(USAGE);
	process.exit(0);
}

if (command === "create") {
	const [type, name, ...fields] = args;

	if (!type || !name) {
		console.error(COLOR.red("Error: Missing arguments for `create` command"));
		console.log(USAGE);
		process.exit(1);
	}

	switch (type) {
		case "controller":
			createController(name);
			break;
		case "model":
			createModel(name, fields);
			break;
		case "job":
			createJob(name, fields);
			break;
		case "view":
			createView(name, fields);
			break;
		case "component":
			createComponent(name, fields);
			break;
		default:
			console.error(COLOR.red(`Error: Unknown type "${type}"`));
			console.log(USAGE);
			process.exit(1);
	}
} else {
	console.error(COLOR.red(`Error: Unknown command "${command}"`));
	console.log(USAGE);
	process.exit(1);
}
