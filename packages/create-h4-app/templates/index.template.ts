export const indexTs = ({
	skipFrontend,
	skipQueue,
	skipScheduler,
}: {
	skipFrontend: boolean;
	skipQueue: boolean;
	skipScheduler: boolean;
}) => `import h4 from "@h4-dev/core";

import h4Server from "@h4-dev/server";
${skipQueue ? "" : 'import h4Queue from "@h4-dev/queue";'}
${skipScheduler ? "" : 'import h4Scheduler from "@h4-dev/scheduler";'}
${skipFrontend ? "" : 'import h4Frontend from "@h4-dev/frontend";'}

const controllersDir = "./src/controllers";
const port = Number(process.env.PORT || "3000");

h4([
	h4Server({ controllersDir, port }),
	${skipQueue ? "" : "h4Queue({ maxCompletedJobsCount: 100 }),"}
	${skipScheduler ? "" : "h4Scheduler({ jobs: [], }),"}	
	${
		skipFrontend
			? ""
			: `h4Frontend({
		entrypoints: ["main.ts", "main.css"],
	}),`
	}
]);`;
