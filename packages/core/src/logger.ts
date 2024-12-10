const colors = {
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	default: "\x1b[39m",
	light_gray: "\x1b[90m",
	light_red: "\x1b[91m",
	light_green: "\x1b[92m",
	light_yellow: "\x1b[93m",
	light_blue: "\x1b[94m",
	light_magenta: "\x1b[95m",
	light_cyan: "\x1b[96m",
	light_white: "\x1b[97m",
} as const;

export default function log({
	type,
	message,
	color = "default",
}: {
	type: "INFO" | "REQUEST" | "ERROR";
	message: string;
	color: keyof typeof colors;
}) {
	const timestamp = new Date().toISOString();

	const logFunction =
		type === "ERROR"
			? console.error
			: type === "REQUEST"
				? console.info
				: console.log;

	logFunction(`${colors[color]}[${timestamp}] [${type}] ${message}\x1b[0m`);
}
