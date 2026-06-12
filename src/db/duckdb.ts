import * as duckdb from "@duckdb/duckdb-wasm";
import ehWorkerUrl from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvpWorkerUrl from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import ehWasmUrl from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import mvpWasmUrl from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import { type Table, Type } from "apache-arrow";

// DuckDB-WASM bootstrap. Bundles are vite-bundled (?url imports) rather than
// pulled from jsdelivr so the app stays fully static and same-origin. The
// async build runs in a plain worker — no SharedArrayBuffer, no COOP/COEP.

const BUNDLES: duckdb.DuckDBBundles = {
	mvp: { mainModule: mvpWasmUrl, mainWorker: mvpWorkerUrl },
	eh: { mainModule: ehWasmUrl, mainWorker: ehWorkerUrl },
};

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
let connPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

async function init(): Promise<duckdb.AsyncDuckDB> {
	const bundle = await duckdb.selectBundle(BUNDLES);
	if (!bundle.mainWorker) throw new Error("no suitable DuckDB bundle");
	const worker = new Worker(bundle.mainWorker);
	const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
	const db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
	return db;
}

/** Memoized database instance; also defuses StrictMode double-init. */
export function getDB(): Promise<duckdb.AsyncDuckDB> {
	dbPromise ??= init();
	return dbPromise;
}

async function openConn(): Promise<duckdb.AsyncDuckDBConnection> {
	const db = await getDB();
	const conn = await db.connect();
	// AT TIME ZONE needs icu. In WASM it's a dynamically loaded extension
	// fetched from the default extension repository on first load.
	await conn.query("INSTALL icu");
	await conn.query("LOAD icu");
	// All queries use explicit AT TIME ZONE conversions; pin the session TZ so
	// timestamp casts never depend on the browser's locale.
	await conn.query("SET TimeZone = 'UTC'");
	return conn;
}

/** One shared connection — the worker serializes queries anyway. */
export function getConn(): Promise<duckdb.AsyncDuckDBConnection> {
	connPromise ??= openConn();
	return connPromise;
}

// --- Arrow → plain JS ------------------------------------------------------

// Arrow hands back BigInt for BIGINT/HUGEINT (every count(*), hour(), year())
// and epoch-millis numbers for TIMESTAMP/DATE. Views expect plain numbers and
// RFC3339 strings like the old Go JSON API produced, so every result goes
// through this normalizer.
function converterFor(typeId: Type): (v: unknown) => unknown {
	switch (typeId) {
		case Type.Timestamp:
			return (v) => (v == null ? null : new Date(Number(v)).toISOString());
		case Type.Date:
			return (v) =>
				v == null ? null : new Date(Number(v)).toISOString().slice(0, 10);
		default:
			return (v) => (typeof v === "bigint" ? Number(v) : v);
	}
}

function tableToRows(table: Table): Record<string, unknown>[] {
	const cols = table.schema.fields.map((f, i) => ({
		name: f.name,
		conv: converterFor(f.type.typeId),
		vec: table.getChildAt(i),
	}));
	const out: Record<string, unknown>[] = [];
	for (let r = 0; r < table.numRows; r++) {
		const row: Record<string, unknown> = {};
		for (const c of cols) row[c.name] = c.conv(c.vec?.get(r));
		out.push(row);
	}
	return out;
}

/**
 * Run SQL and get plain JS rows back. Uses `?` placeholders via a prepared
 * statement when params are given — same shape as the Go backend's queries.
 */
export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
	const conn = await getConn();
	if (!params || params.length === 0) {
		return tableToRows(await conn.query(sql)) as T[];
	}
	const stmt = await conn.prepare(sql);
	try {
		return tableToRows(await stmt.query(...params)) as T[];
	} finally {
		await stmt.close();
	}
}
