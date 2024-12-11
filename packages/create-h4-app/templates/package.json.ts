export const packageJson = (name: string) => ({
	name,
	type: "module",
	dependencies: {
		"@h4-dev/core": "{{version}}",
		"@h4-dev/jobs": "{{version}}",
		"@h4-dev/models": "{{version}}",
		"@h4-dev/queue": "{{version}}",
		"@h4-dev/scheduler": "{{version}}",
		"@h4-dev/server": "{{version}}",
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
		fmt: "bun run biome check --write ./src",
	},
});
