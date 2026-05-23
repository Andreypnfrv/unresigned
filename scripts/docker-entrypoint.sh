#!/usr/bin/env sh
set -eu
export SKIP_VERCEL_CODE_PULL="${SKIP_VERCEL_CODE_PULL:-true}"

cd /usr/src/app

if [ -z "${PG_URL:-}" ]; then
  echo "PG_URL is required" >&2
  exit 1
fi

if ! node <<'NODE'
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.PG_URL });
  await c.connect();
  const r = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Posts'",
  );
  await c.end();
  process.exit(r.rows.length ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
NODE
then
  echo "Applying schema/accepted_schema.sql"
  node <<'NODE'
const fs = require('fs');
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.PG_URL });
  await c.connect();
  const sql = fs.readFileSync('/usr/src/app/schema/accepted_schema.sql', 'utf8');
  await c.query(sql);
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
NODE
fi

echo "Running migrations"
yarn migrate up prod ur

# Railway has no Vercel-style cron; dispatch notification emails via debouncer.
if [ -n "${CRON_SECRET:-}" ]; then
  (
    PORT="${PORT:-3000}"
    for _ in $(seq 1 120); do
      curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1 && break
      sleep 1
    done
    while true; do
      curl -sf -H "Authorization: Bearer ${CRON_SECRET}" \
        "http://127.0.0.1:${PORT}/api/cron/every-minute" >/dev/null 2>&1 || true
      sleep 60
    done
  ) &
fi

exec yarn next start -H 0.0.0.0
