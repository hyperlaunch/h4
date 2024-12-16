#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { write } from "bun";
import { controllerTs } from "./templates/controller";
import { jobTs } from "./templates/job";
import { modelTs } from "./templates/model";

const USAGE = `
Usage:
  h4 create controller <path/to/controller>
  h4 create model <model-name> [field:type ...]
  h4 create job <job-name>
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
	migrate: "db/migrate",
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
	// Parse fields into TypeScript and SQLite column types
	const parsedFieldsTS = fields.map(parseField(TYPE_MAPPING_TS));
	const parsedFieldsSQL = fields.map(parseField(TYPE_MAPPING_SQLITE));

	// Add non-null assertion (!) for TypeScript fields
	const tsFields = parsedFieldsTS
		.map(([fieldName, fieldType]) => `${fieldName}!: ${fieldType};`)
		.join("\n\t");

	const sqlFields = parsedFieldsSQL
		.map(([fieldName, sqlType]) => `  ${fieldName} ${sqlType}`)
		.join(",\n");

	// Model file
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

	// Migration file
	const timestamp = getCurrentTimestamp();
	const migrationFilePath = resolve(
		BASE_PATHS.migrate,
		`${timestamp}_create_${formatToFileName(name)}.sql`,
	);
	const migrationContent = `-- migrate:up transaction:false
CREATE TABLE ${formatToTableName(name)} (
${sqlFields}
);

-- migrate:down
DROP TABLE ${formatToTableName(name)};
`;
	await createFile(migrationFilePath, migrationContent);
}

async function createJob(name: string) {
	const jobFilePath = resolve(BASE_PATHS.job, `${formatToFileName(name)}.ts`);
	const jobContent = jobTs(formatToClassName(name));
	await createFile(jobFilePath, jobContent);
}

function parseField(mapping: Record<string, string>) {
	return (field: string): [string, string] => {
		const [name, type] = field.split(":");
		const mappedType = mapping[type];
		if (!mappedType) {
			console.error(COLOR.red(`Error: Unsupported type "${type}"`));
			process.exit(1);
		}
		return [name, mappedType];
	};
}

function formatToClassName(input: string): string {
	return input
		.replace(/[-_]+/g, " ")
		.replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
		.replace(/\s+/g, "");
}

function formatToFileName(input: string): string {
	return input.replace(/[-_]+/g, "-").toLowerCase();
}

function formatToTableName(input: string): string {
	return input.replace(/[-_]+/g, "_").toLowerCase();
}

function basename(path: string) {
	return String(path.split("/").pop());
}

function getCurrentTimestamp(): string {
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
			createJob(name);
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
