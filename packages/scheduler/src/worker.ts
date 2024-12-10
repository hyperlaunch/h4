import log from "@h4/core/logger";
import { type CronSyntax, shouldRunAtTime } from "./cron";

declare const self: Worker;

type ScheduleConfig = {
	cron: CronSyntax;
	filepath: string;
};

let schedule: ScheduleConfig[] = [];

function startScheduler() {
	const now = new Date();
	const msUntilNextMinute =
		(60 - now.getSeconds()) * 1000 - now.getMilliseconds();

	log({
		type: "INFO",
		message: `First scheduler run in ${Math.round(msUntilNextMinute / 1000)}s`,
		color: "yellow",
	});

	setTimeout(() => {
		checkSchedule();
		setInterval(checkSchedule, 60_000);
	}, msUntilNextMinute);
}

self.onmessage = async (event: MessageEvent) => {
	const { type, schedule: newSchedule } = event.data;

	switch (type) {
		case "INIT":
			schedule = newSchedule;
			startScheduler();
			break;
	}
};

async function checkSchedule() {
	const now = new Date();

	for (const task of schedule) {
		try {
			if (shouldRunAtTime(task.cron, now)) {
				const JobClass = (await import(task.filepath)).default;
				const jobInstance = new JobClass();
				const jobName = jobInstance.constructor.name;

				postMessage({
					status: "in_progress",
					jobName,
				});

				const result = await jobInstance.run();

				postMessage({
					status: "success",
					jobName,
					result,
				});
			}
		} catch (error) {
			postMessage({
				status: "error",
				error: (error as { message: string }).message,
			});
		}
	}
}
