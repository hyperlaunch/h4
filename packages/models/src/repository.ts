import type { Database, SQLQueryBindings } from "bun:sqlite";
import { loadConfig } from "@h4-dev/core/config";
import { randomUUIDv7 } from "bun";
import type { H4BaseModel } from ".";
import { QueryBuilder } from "./query";

const config = await loadConfig();

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
		return stmt.as(this.model).get(...values);
	}

	query() {
		return new QueryBuilder<T>(this.table, this.db, this.model);
	}
}
