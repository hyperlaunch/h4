// Surpress errors when using Bun's import txt file
declare module "*.txt" {
	let text: string;
	export = text;
}
