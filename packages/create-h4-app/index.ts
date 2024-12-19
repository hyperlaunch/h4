#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { Glob } from "bun";
import { apiControllerTs } from "./templates/api-controller.template";
import { biomeJson } from "./templates/biome.json";
import genesis from "./templates/genesis.sql.txt" with { type: "text" };
import gitignore from "./templates/gitignore.txt" with { type: "text" };
import { h4Config } from "./templates/h4.config";
import { indexTs } from "./templates/index.template";
import mainCss from "./templates/main.css.txt" with { type: "text" };
import { mainTs } from "./templates/main.template";
import { packageJson } from "./templates/package.json";
import { readmeMd } from "./templates/readme.md";
import { tsconfigJson } from "./templates/tsconfig.json";
import { viewControllerTs } from "./templates/view-controller.template";
import { viewTs } from "./templates/view.template";

const USAGE = `
Usage:
  bun x create-h4-app [options] <path>

Options:
  --skip-frontend      Exclude frontend files and directories.
  --skip-queue         Exclude queue worker setup.
  --skip-scheduler     Exclude scheduler worker setup.
  --skip-views         Exclude view files and directories.
  --name=<name>        Set the project name explicitly.
  --help               Show this help message.
`;

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
		.slice(0, 14);
}

function parseArgs(args: string[]) {
	const options: {
		skipFrontend: boolean;
		skipQueue: boolean;
		skipScheduler: boolean;
		skipViews: boolean;
		name?: string;
		path?: string;
	} = {
		skipFrontend: false,
		skipQueue: false,
		skipScheduler: false,
		skipViews: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith("--")) {
			if (arg === "--skip-frontend") options.skipFrontend = true;
			else if (arg === "--skip-queue") options.skipQueue = true;
			else if (arg === "--skip-scheduler") options.skipScheduler = true;
			else if (arg === "--skip-views") options.skipViews = true;
			else if (arg.startsWith("--name=")) options.name = arg.split("=")[1];
			else if (arg === "--help") {
				console.log(USAGE);
				process.exit(0);
			}
		} else {
			options.path = arg;
		}
	}

	return options;
}

const args = parseArgs(process.argv.slice(2));

if (!args.path) {
	console.error(COLOR.red("Error: No path provided."));
	console.log(USAGE);
	process.exit(1);
}

const projectDir = String(args.path);
const absoluteDir = `${process.cwd()}/${projectDir}`;

const defaultName = formatProjectName(
	args.name ||
		(projectDir === "./" ? "h4-app" : projectDir.split("/").pop() || "h4-app"),
);
const projectName = args.name || defaultName;

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
!args.skipQueue &&
	!args.skipScheduler &&
	(await mkdir(`${absoluteDir}/src/jobs`, { recursive: true }));
if (!args.skipFrontend)
	await mkdir(`${absoluteDir}/src/frontend`, { recursive: true });
if (!args.skipViews)
	await mkdir(`${absoluteDir}/src/views`, { recursive: true });
await mkdir(`${absoluteDir}/public`, { recursive: true });
await mkdir(`${absoluteDir}/db/migrations`, { recursive: true });

const files = {
	"package.json": JSON.stringify(
		packageJson({
			name: String(args.name),
			skipFrontend: args.skipFrontend,
			skipQueue: args.skipQueue,
			skipScheduler: args.skipScheduler,
			skipViews: args.skipViews,
		}),
		null,
		2,
	),
	"biome.json": JSON.stringify(biomeJson, null, 2),
	"h4.config.ts": h4Config({
		skipQueue: args.skipQueue,
	}),
	"index.ts": indexTs({
		skipFrontend: args.skipFrontend,
		skipQueue: args.skipQueue,
		skipScheduler: args.skipScheduler,
	}),
	"README.md": readmeMd(projectName),
	"src/controllers/index.ts": args.skipViews
		? apiControllerTs
		: viewControllerTs,
	"src/models/.keep": "",
	...(args.skipQueue && args.skipScheduler ? {} : { "src/jobs/.keep": "" }),
	...(!args.skipFrontend
		? { "src/frontend/main.ts": mainTs, "src/frontend/main.css": mainCss }
		: {}),
	...(args.skipViews ? {} : { "src/views/.keep": "" }),
	"public/.keep": "",
	".gitignore": gitignore,
	"tsconfig.json": JSON.stringify(
		tsconfigJson({ skipViews: args.skipViews }),
		null,
		2,
	),
	[`db/migrations/${getCurrentTimestamp()}_genesis.sql`]: genesis,
	...(args.skipQueue
		? {}
		: { "worker.queue.ts": 'export * from "@h4-dev/queue/worker";' }),
	...(args.skipScheduler
		? {}
		: { "worker.scheduler.ts": 'export * from "@h4-dev/scheduler/worker";' }),
	...(args.skipViews ? {} : { "src/views/index.tsx": viewTs }),
};

for (const [filename, content] of Object.entries(files)) {
	await Bun.write(`${absoluteDir}/${filename}`, content);
}

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
