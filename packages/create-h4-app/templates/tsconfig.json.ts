export const tsconfigJson = ({ skipViews }: { skipViews: boolean }) => ({
	compilerOptions: {
		lib: ["ESNext", "DOM"],
		target: "ESNext",
		module: "ESNext",
		moduleDetection: "force",
		...(skipViews
			? {}
			: {
					jsx: "react-jsx",
					jsxImportSource: "@kitajs/html",
					plugins: [{ name: "@kitajs/ts-html-plugin" }],
				}),
		allowJs: true,
		moduleResolution: "bundler",
		allowImportingTsExtensions: true,
		verbatimModuleSyntax: true,
		noEmit: true,
		strict: true,
		skipLibCheck: true,
		noFallthroughCasesInSwitch: true,
		noUnusedLocals: false,
		noUnusedParameters: false,
		noPropertyAccessFromIndexSignature: false,
	},
	include: skipViews ? ["src/**/*.ts"] : ["src/**/*.ts", "src/**/*.tsx"],
	exclude: ["node_modules"],
});
