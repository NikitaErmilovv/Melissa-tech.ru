export function fail(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "не получилось";
  return Response.json({ error: message }, { status });
}
