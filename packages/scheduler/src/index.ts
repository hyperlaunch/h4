import log from "@h4/core/logger";
import type { H4SchedulableJob } from "@h4/jobs/schedulable";
import type { CronSyntax } from "./cron";

type ScheduledTask = {
	cron: CronSyntax;
	job: new () => H4SchedulableJob;
};

const workerUrl = new URL("worker.ts", import.meta.url);
const worker = new Worker(workerUrl);

worker.onmessage = (event) => {
	event.data.status === "in_progress"
		? log({
				type: "INFO",
				message: `Scheduled task ${event.data.jobName}: in_progress`,
				color: "yellow",
			})
		: event.data.status === "error"
			? log({
					type: "ERROR",
					message: `Scheduled task failed: error: ${JSON.stringify(event.data.error)}`,
					color: "red",
				})
			: log({
					type: "INFO",
					message: `Scheduled task ${event.data.jobName}: completed`,
					color: "green",
				});
};

export default function h4Scheduler({ jobs }: { jobs: ScheduledTask[] }) {
	return async () => {
		log({
			type: "INFO",
			message: `Scheduler running ${jobs.length} task(s) at ${workerUrl}`,
			color: "cyan",
		});
		const taskConfigs = jobs.map((task) => ({
			cron: task.cron,
			filepath: new task.job().filepath,
		}));

		worker.postMessage({ type: "INIT", schedule: taskConfigs });
	};
}
