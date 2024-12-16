/// <reference lib="webworker" />

import log from "@h4-dev/core/logger";

self.onmessage = async (event: MessageEvent) => {
	const { id, filepath, props } = event.data;

	try {
		if (!filepath) throw new Error("Job file path not provided");

		const JobClass = (await import(filepath)).default;
		const jobInstance = new JobClass({ props });

		if (typeof jobInstance.run === "function") {
			const result = await jobInstance.run(props);

			return postMessage({ status: "success", id, result });
		}

		throw new Error(
			`${jobInstance.constructor.name} does not have a run method`,
		);
	} catch (error) {
		log({
			type: "ERROR",
			message: `Job ${event.data.id} updated with status: failed, error`,
			color: "red",
		});
		console.error(error);
	}
};
