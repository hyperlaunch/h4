export const packageJson = ({
	skipFrontend,
	skipViews,
	skipQueue,
	skipScheduler,
	name,
}: {
	skipFrontend: boolean;
	skipViews: boolean;
	skipQueue: boolean;
	skipScheduler: boolean;
	name: string;
}) => ({
	name,
	type: "module",
	dependencies: {
		"@h4-dev/core": "{{version}}",
		"@h4-dev/models": "{{version}}",
		"@h4-dev/server": "{{version}}",
		...(skipQueue ? {} : { "@h4-dev/queue": "{{version}}" }),
		...(skipScheduler ? {} : { "@h4-dev/scheduler": "{{version}}" }),
		...(skipQueue && skipScheduler ? {} : { "@h4-dev/jobs": "{{version}}" }),
		...(skipFrontend ? {} : { "@h4-dev/frontend": "{{version}}" }),
		...(skipViews
			? {}
			: {
					"@h4-dev/views": "{{version}}",
					"@kitajs/html": "^4.2.6",
					"@kitajs/ts-html-plugin": "^4.1.1",
				}),
	},
	devDependencies: {
		dbmate: "^2.24.0",
		"@biomejs/biome": "^1.9.4",
		"@types/bun": "latest",
		typescript: "^5.0.0",
	},
	scripts: {
		dev: "bun run --hot ./index.ts",
		build: "bun build --compile ./index.ts --outfile release",
		dbmate: "DATABASE_URL='sqlite:storage/primary.db' dbmate",
		fmt: "bun run biome check --write ./src",
	},
});
