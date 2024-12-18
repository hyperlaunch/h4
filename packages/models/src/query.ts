import type { Database, SQLQueryBindings } from "bun:sqlite";

type FieldType<T, K extends keyof T> = T[K];
type OrderDirection = "ASC" | "DESC";

export class QueryBuilder<T> {
	protected conditions: string[] = [];
	protected values: SQLQueryBindings[] = [];
	private limitValue?: number;
	private offsetValue?: number;
	private orderClauses: string[] = [];
	private groupByClauses: string[] = [];
	private havingClauses: string[] = [];
	private joinClauses: string[] = [];

	constructor(
		protected table: string,
		protected db: Database,
		protected model: new () => T,
	) {}

	where<K extends keyof T>(
		field: ((builder: QueryBuilder<T>) => QueryBuilder<T>) | K,
		value: K extends keyof T ? FieldType<T, K> : never,
	) {
		if (typeof field === "function") {
			const subBuilder = new QueryBuilder<T>(this.table, this.db, this.model);
			field(subBuilder);
			this.conditions.push(`(${subBuilder.conditions.join(" AND ")})`);
			this.values.push(...subBuilder.values);
		} else {
			this.conditions.push(`${String(field)} = ?`);
			this.values.push(value as SQLQueryBindings);
		}
		return this;
	}

	orWhere(callback: (builder: QueryBuilder<T>) => void) {
		const subBuilder = new QueryBuilder<T>(this.table, this.db, this.model);
		callback(subBuilder);
		if (subBuilder.conditions.length) {
			if (this.conditions.length) {
				this.conditions.push("OR");
			}
			this.conditions.push(`(${subBuilder.conditions.join(" AND ")})`);
			this.values.push(...subBuilder.values);
		}
		return this;
	}

	whereNot<K extends keyof T>(field: K, value: FieldType<T, K>) {
		this.conditions.push(`${String(field)} != ?`);
		this.values.push(value as SQLQueryBindings);
		return this;
	}

	whereIn<K extends keyof T>(field: K, values: FieldType<T, K>[]) {
		this.conditions.push(
			`${String(field)} IN (${values.map(() => "?").join(", ")})`,
		);
		this.values.push(...(values as SQLQueryBindings[]));
		return this;
	}

	whereLike<K extends keyof T>(field: K, pattern: string) {
		this.conditions.push(`${String(field)} LIKE ?`);
		this.values.push(pattern);
		return this;
	}

	join<R>(table: string, on: string) {
		this.joinClauses.push(`INNER JOIN ${table} ON ${on}`);
		return this;
	}

	leftJoin<R>(table: string, on: string) {
		this.joinClauses.push(`LEFT JOIN ${table} ON ${on}`);
		return this;
	}

	orderBy<K extends keyof T>(field: K, direction: OrderDirection = "ASC") {
		this.orderClauses.push(`${String(field)} ${direction}`);
		return this;
	}

	groupBy<K extends keyof T>(field: K) {
		this.groupByClauses.push(String(field));
		return this;
	}

	having(condition: string, ...values: SQLQueryBindings[]) {
		this.havingClauses.push(condition);
		this.values.push(...values);
		return this;
	}

	limit(value: number) {
		this.limitValue = value;
		return this;
	}

	offset(value: number) {
		this.offsetValue = value;
		return this;
	}

	toSql() {
		const parts = [
			`SELECT * FROM ${this.table}`,
			...this.joinClauses,
			this.conditions.length ? `WHERE ${this.conditions.join(" ")}` : "",
			this.groupByClauses.length
				? `GROUP BY ${this.groupByClauses.join(", ")}`
				: "",
			this.havingClauses.length
				? `HAVING ${this.havingClauses.join(" AND ")}`
				: "",
			this.orderClauses.length
				? `ORDER BY ${this.orderClauses.join(", ")}`
				: "",
			this.limitValue ? `LIMIT ${this.limitValue}` : "",
			this.offsetValue ? `OFFSET ${this.offsetValue}` : "",
		].filter(Boolean);

		return parts.join(" ");
	}

	first() {
		const sql = this.toSql();
		return this.db
			.query(sql)
			.as(this.model)
			.get(...this.values);
	}

	exists() {
		const sql = `SELECT 1 FROM ${this.table}
            ${this.joinClauses.length ? this.joinClauses.join(" ") : ""}
            ${
							this.conditions.length ? `WHERE ${this.conditions.join(" ")}` : ""
						}
            LIMIT 1`;

		const result = this.db.query(sql).get(...this.values);

		return result !== null;
	}

	all() {
		const sql = this.toSql();
		return this.db
			.query(sql)
			.as(this.model)
			.all(...this.values);
	}

	update(params: Partial<T>) {
		const updates = Object.entries(params)
			.map(([key]) => `${key} = ?`)
			.join(", ");

		const values: SQLQueryBindings[] = Object.values(params);
		const sql = `
		  UPDATE ${this.table}
		  SET ${updates}
		  ${this.conditions.length ? `WHERE ${this.conditions.join(" ")}` : ""}
		  RETURNING *
		`.trim();

		return this.db
			.query(sql)
			.as(this.model)
			.all(...[...values, ...this.values]);
	}

	delete() {
		const sql = `
		  DELETE FROM ${this.table}
		  ${this.conditions.length ? `WHERE ${this.conditions.join(" ")}` : ""}
		  RETURNING *
		`.trim();

		return this.db
			.query(sql)
			.as(this.model)
			.all(...this.values);
	}
}
