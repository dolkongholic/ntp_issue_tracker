type LogMeta = Record<string, unknown>;

function line(level: "INFO" | "WARN", method: string, path: string, meta: LogMeta) {
  const parts = Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`);
  return `[${new Date().toISOString()}] [${level}] ${method} ${path}${
    parts.length ? " " + parts.join(" ") : ""
  }`;
}

export function logAccess(method: string, path: string, meta: LogMeta = {}) {
  console.log(line("INFO", method, path, meta));
}

export function logAction(
  method: string,
  path: string,
  actor: string | null | undefined,
  action: string,
  meta: LogMeta = {}
) {
  console.log(
    line("INFO", method, path, { actor: actor ?? "unknown", action, ...meta })
  );
}

export function logWarn(method: string, path: string, meta: LogMeta = {}) {
  console.log(line("WARN", method, path, meta));
}
