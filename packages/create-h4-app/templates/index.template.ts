export const indexTs = `import h4 from "@h4/core";
import h4Queue from "@h4/queue";
import h4Scheduler from "@h4/scheduler";
import h4Server from "@h4/server";

const controllersDir = "./src/controllers";
const port = Number(process.env.PORT || "3000");

h4([
	h4Server({ controllersDir, port }),
	h4Queue({ maxCompletedJobsCount: 100 }),
	h4Scheduler({
		jobs: [],
	}),
]);`;
