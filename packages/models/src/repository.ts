import type { Database, SQLQueryBindings, SQLiteError } from "bun:sqlite";
import { loadConfig } from "@h4-dev/core/config";
import { randomUUIDv7 } from "bun";
import type { H4BaseModel } from ".";
import { QueryBuilder } from "./query";

const config = await loadConfig();

type Errors = Record<string, string>;

type H4RepositoryOptions<T> = {
	table: string;
	model: new () => T;
	db?: Database;
};

export class H4Repository<
	T extends H4BaseModel,
	UseUuid extends boolean = false,
> {
	private readonly table: string;
	private readonly model: new () => T;
	private readonly db: Database;
	private readonly useUuid: UseUuid;

	constructor({
		table,
		model,
		db = config.primaryDb,
		useUuid = false as UseUuid,
	}: H4RepositoryOptions<T> & { useUuid?: UseUuid }) {
		this.table = table;
		this.model = model;
		this.db = db;
		this.useUuid = useUuid;
	}

	create(params: UseUuid extends true ? Omit<T, "id"> & { id?: string } : T) {
		try {
			const fullParams =
				this.useUuid && !("id" in params && params.id)
					? { ...params, id: randomUUIDv7() }
					: params;

			const columns = Object.keys(fullParams);
			const stmt = this.db.prepare(
				`INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${columns
					.map(() => "?")
					.join(", ")}) RETURNING *`,
			);

			const values: SQLQueryBindings[] = Object.values(fullParams);

			const result = stmt.as(this.model).get(...values);

			return { result, errors: undefined };
		} catch (error) {
			const errors = this.translateSqliteError(error as SQLiteError);
			console.error(error);
			return { errors, result: undefined };
		}
	}

	query() {
		return new QueryBuilder<T>(this.table, this.db, this.model);
	}

	private translateSqliteError(error: SQLiteError): Errors {
		const errors: Errors = {};

		if (error?.code) {
			switch (error.code) {
				case "SQLITE_CONSTRAINT_UNIQUE":
					this.handleUniqueConstraintError(error.message, errors);
					break;
				case "SQLITE_CONSTRAINT_NOTNULL":
					this.handleNotNullConstraintError(error.message, errors);
					break;
				case "SQLITE_CONSTRAINT_CHECK":
					this.handleCheckConstraintError(error.message, errors);
					break;
				default:
					errors._base = "A database constraint was violated.";
			}
		} else {
			errors._base = "Unexpected error.";
		}

		return errors;
	}

	private handleUniqueConstraintError(message: string, errors: Errors) {
		const match = message.match(/UNIQUE constraint failed: ([\w.]+)/);
		if (match) {
			const field = match[1].split(".").pop() || "field";
			errors[field] = `${this.humanize(field)} must be unique.`;
		} else {
			errors._base = "A unique constraint was violated.";
		}
	}

	private handleNotNullConstraintError(message: string, errors: Errors) {
		const match = message.match(/NOT NULL constraint failed: ([\w.]+)/);
		if (match) {
			const field = match[1].split(".").pop() || "field";
			errors[field] = `${this.humanize(field)} is required.`;
		} else {
			errors._base = "A required field is missing.";
		}
	}

	private handleCheckConstraintError(message: string, errors: Errors) {
		const match = message.match(/CHECK constraint failed: ([\w\s\W]+)/);
		if (match) {
			const condition = match[1];
			const fieldMatch = condition.match(/([\w]+)\s*(>=|<=|>|<|=|!=)/);
			if (fieldMatch) {
				const field = fieldMatch[1];
				errors[field] = `${this.humanize(field)} is invalid.`;
			} else {
				errors._base = `A condition failed: ${condition}.`;
			}
		} else {
			errors._base = "A check constraint was violated.";
		}
	}

	private humanize(field: string): string {
		return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	}
}
