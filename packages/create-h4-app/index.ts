#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { Glob } from "bun";
import { biomeJson } from "./templates/biome.json";
import { controllerTs } from "./templates/controller";
import genesis from "./templates/genesis.sql.txt" with { type: "text" };
import gitignore from "./templates/gitignore.txt" with { type: "text" };
import { h4Config } from "./templates/h4.config";
import { indexTs } from "./templates/index.template";
import mainCss from "./templates/main.css.txt" with { type: "text" };
import { mainTs } from "./templates/main.template";
import { packageJson } from "./templates/package.json";
import { readmeMd } from "./templates/readme.md";
import { tsconfigJson } from "./templates/tsconfig.json";

async function prompt(query: string) {
	process.stdout.write(query);
	const response = await new Promise<string>((resolve) => {
		process.stdin.once("data", (data) => {
			resolve(data.toString().trim());
		});
	});
	return response;
}

const COLOR = {
	blue: (str: string) => `\x1b[34m${str}\x1b[0m`,
	green: (str: string) => `\x1b[32m${str}\x1b[0m`,
	red: (str: string) => `\x1b[31m${str}\x1b[0m`,
	cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
};

async function isDirectoryEmpty(path: string) {
	try {
		const entries = Array.from(
			new Glob(`${path}/*`).scanSync({ onlyFiles: false }),
		);

		return entries.length === 0;
	} catch {
		return true;
	}
}

function formatProjectName(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function getCurrentTimestamp() {
	const now = new Date();
	return now
		.toISOString()
		.replace(/[-:TZ]/g, "")
		.slice(0, 14); // YYYYMMDDHHMMSS
}

console.log(COLOR.cyan("\nWelcome to create-h4-app\n"));

const defaultDir = "./";
const projectDir =
	(await prompt(
		`Where should we create your project? ${COLOR.blue(`(${defaultDir})`)} `,
	)) || defaultDir;
const absoluteDir = `${process.cwd()}/${projectDir}`;

const defaultName = formatProjectName(
	projectDir === "./" ? "h4-app" : projectDir.split("/").pop() || "h4-app",
);
const projectName =
	(await prompt(
		`What is your project named? ${COLOR.blue(`(${defaultName})`)} `,
	)) || defaultName;

const defaultApiOnlyAnswer = "N";
const apiOnlyAnswer =
	(await prompt(
		`Is this an API only project? ${COLOR.blue(`(${defaultApiOnlyAnswer})`)} `,
	)) || defaultApiOnlyAnswer;
const apiOnly = apiOnlyAnswer === "Y";

if (!(await isDirectoryEmpty(absoluteDir))) {
	console.error(
		COLOR.red(
			"\nError: Directory exists and is not empty. Please choose another location.",
		),
	);
	process.exit(1);
}

console.log(`\nCreating project in ${COLOR.green(absoluteDir)}...`);
await mkdir(absoluteDir, { recursive: true });
await mkdir(`${absoluteDir}/src/controllers`, { recursive: true });
await mkdir(`${absoluteDir}/storage`, { recursive: true });
await mkdir(`${absoluteDir}/src/models`, { recursive: true });
await mkdir(`${absoluteDir}/src/jobs`, { recursive: true });
!apiOnly && (await mkdir(`${absoluteDir}/src/frontend`, { recursive: true }));
await mkdir(`${absoluteDir}/public`, { recursive: true });
await mkdir(`${absoluteDir}/db/migrations`, { recursive: true });

const files = {
	"package.json": JSON.stringify(packageJson(projectName, apiOnly), null, 2),
	"biome.json": JSON.stringify(biomeJson, null, 2),
	"h4.config.ts": h4Config,
	"index.ts": indexTs(apiOnly),
	"README.md": readmeMd(projectName),
	"src/controllers/index.ts": controllerTs,
	"src/models/.keep": "",
	"src/jobs/.keep": "",
	...(apiOnly
		? {}
		: { "src/frontend/main.ts": mainTs, "src/frontend/main.css": mainCss }),
	"public/.keep": "",
	".gitignore": gitignore,
	"tsconfig.json": JSON.stringify(tsconfigJson, null, 2),
	[`db/migrations/${getCurrentTimestamp()}_genesis.sql`]: genesis,
	"worker.queue.ts": 'export * from "@h4-dev/queue/worker";',
	"worker.scheduler.ts": 'export * from "@h4-dev/scheduler/worker";',
};

for (const [filename, content] of Object.entries(files))
	await Bun.write(`${absoluteDir}/${filename}`, content);

console.log("\nInstalling dependencies...");
const bunInstall = Bun.spawn(["bun", "install"], {
	cwd: absoluteDir,
	stdout: "inherit",
	stderr: "inherit",
});
await bunInstall.exited;

console.log("\nRunning Biome formatter...");
const biomeFormat = Bun.spawn(["bun", "run", "biome", "check", "--write"], {
	cwd: absoluteDir,
	stdout: "inherit",
	stderr: "inherit",
});
await biomeFormat.exited;

console.log(COLOR.green("\n✨ Project created successfully!\n"));
console.log(`Next steps:
1. ${COLOR.cyan(`cd ${projectDir}`)}
2. ${COLOR.cyan("bun run dev")}\n`);

process.exit(0);
