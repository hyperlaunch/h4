/// <reference lib="webworker" />

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
		postMessage({
			status: "error",
			id,
			error: (error as { message: string }).message,
		});
	}
};
