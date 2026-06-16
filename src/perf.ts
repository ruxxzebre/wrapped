// Dev-only load-timing instrumentation. DEV is `import.meta.env.DEV`, a
// compile-time constant Vite folds to `false` in prod. Every export early-
// returns on `!DEV`, so all the actual work — the console logs and the
// performance.mark/measure (User Timing) calls — is dead-code-eliminated from
// the prod bundle; nothing is logged and no perf entries are emitted. Same
// stripping trick as the devtools import in main.tsx.
//
// Every call site guards its invocation with `import.meta.env.DEV ? time(...)
// : fn()`, so in prod the timing calls (and their stage-name string literals)
// tree-shake out entirely — this whole module ends up unreferenced and dropped
// from the prod bundle.
//
// Two channels, no extra deps:
//   • performance.mark/measure → DevTools ▸ Performance panel. Record a load,
//     and the `load:` measures sit in the flamechart against paint/resource
//     timings so you can see which stage overlapped what.
//   • a console summary → a quick flat read without opening the panel.
// All numbers are performance.now() ms (relative to navigation start), so the
// offsets line up with the browser's own marks.

const DEV = import.meta.env.DEV;
const PREFIX = "load:"; // namespaces our User Timing entries in the panel

/** Instant mark for a milestone (e.g. "first route painted"). */
export function mark(name: string): void {
	if (!DEV) return;
	performance.mark(`${PREFIX}${name}`);
	console.debug(`⏱ ${name} @ ${performance.now().toFixed(0)}ms`);
}

/**
 * Times an async stage end-to-end. Records a User Timing measure named
 * `${PREFIX}${name}` spanning the call and logs `name: <dur>ms (@ <offset>ms)`.
 * Returns fn()'s value untouched, so wrap inline:
 *   `connPromise ??= time("conn warm", openConn);`
 */
export async function time<T>(name: string, fn: () => Promise<T>): Promise<T> {
	if (!DEV) return fn();
	const start = performance.now();
	try {
		return await fn();
	} finally {
		const end = performance.now();
		// measure(name, { start, end }) avoids needing paired start/end marks.
		performance.measure(`${PREFIX}${name}`, { start, end });
		console.debug(
			`⏱ ${name}: ${(end - start).toFixed(1)}ms (@ ${start.toFixed(0)}ms)`,
		);
	}
}

/** Compact one-line label for an ad-hoc SQL string (per-query timing). */
function sqlLabel(sql: string): string {
	return sql.replace(/\s+/g, " ").trim().slice(0, 64);
}

/** Times a single SQL execution; wraps the body of query() in duckdb.ts. */
export function timeSql<T>(sql: string, fn: () => Promise<T>): Promise<T> {
	if (!DEV) return fn();
	return time(`sql ${sqlLabel(sql)}`, fn);
}
