type MinuteField =
	| "*"
	| `${number}`
	| `${number}-${number}`
	| `${number}/${number}`
	| `${number}-${number}/${number}`
	| `*/${number}`;
type HourField =
	| "*"
	| `${number}`
	| `${number}-${number}`
	| `${number}/${number}`
	| `${number}-${number}/${number}`
	| `*/${number}`;
type DayField =
	| "*"
	| `${number}`
	| `${number}-${number}`
	| `${number}/${number}`
	| `${number}-${number}/${number}`
	| `*/${number}`;
type MonthField =
	| "*"
	| `${number}`
	| `${number}-${number}`
	| `${number}/${number}`
	| `${number}-${number}/${number}`
	| `*/${number}`;
type WeekdayField =
	| "*"
	| `${number}`
	| `${number}-${number}`
	| `${number}/${number}`
	| `${number}-${number}/${number}`
	| `*/${number}`;

export type CronSyntax =
	`${MinuteField} ${HourField} ${DayField} ${MonthField} ${WeekdayField}`;

export function shouldRunAtTime(expr: CronSyntax, date: Date): boolean {
	const fields = expr.split(" ");
	const timeFields = [
		date.getMinutes(),
		date.getHours(),
		date.getDate(),
		date.getMonth() + 1,
		date.getDay(),
	];

	return fields.every((field, idx) => matchesField(field, timeFields[idx]));
}

function matchesField(field: string, value: number): boolean {
	if (field === "*") return true;

	if (field.includes("/")) {
		const [base, step] = field.split("/");
		const stepNum = Number(step);
		if (base === "*") {
			return value % stepNum === 0;
		}
		const nextRun = Math.ceil(value / stepNum) * stepNum;
		return nextRun === value;
	}

	if (field.includes("-")) {
		const [start, end] = field.split("-").map(Number);
		return value >= start && value <= end;
	}

	return Number(field) === value;
}
