export const packageJson = (name: string) => ({
	name,
	type: "module",
	dependencies: {
		"@h4/core": "^0.0.1",
		"@h4/jobs": "^0.0.1",
		"@h4/models": "^0.0.1",
		"@h4/queue": "^0.0.1",
		"@h4/scheduler": "^0.0.1",
		"@h4/server": "^0.0.1",
	},
	devDependencies: {
		dbmate: "^2.23.0",
		"@biomejs/biome": "^1.9.4",
		"@types/bun": "latest",
		typescript: "^5.0.0",
	},
	scripts: {
		dev: "bun run --hot ./index.ts",
		build: "bun build --compile ./index.ts --outfile release",
		dbmate: "DATABASE_URL='sqlite:storage/primary.db' dbmate",
	},
});
