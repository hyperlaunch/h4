export const indexTs = (apiOnly = false) => `import h4 from "@h4-dev/core";
import h4Queue from "@h4-dev/queue";
import h4Scheduler from "@h4-dev/scheduler";
import h4Server from "@h4-dev/server";
${apiOnly ? "" : 'import h4Frontend from "@h4-dev/frontend";'}

const controllersDir = "./src/controllers";
const port = Number(process.env.PORT || "3000");

h4([
	h4Server({ controllersDir, port }),
	h4Queue({ maxCompletedJobsCount: 100 }),
	h4Scheduler({
		jobs: [],
	}),
	${
		apiOnly
			? ""
			: `h4Frontend({
		entrypoints: ["main.ts", "main.css"],
	}),`
	}
]);`;
