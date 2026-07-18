-- Roles for PostgREST. Runs once on first database init (docker-entrypoint-initdb.d).
-- web_anon: read-only role PostgREST switches into for anonymous requests.
-- authenticator: the login role PostgREST connects as; it can assume web_anon.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'web_anon') THEN
        CREATE ROLE web_anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'salepilot';
    END IF;
END
$$;

GRANT web_anon TO authenticator;
GRANT USAGE ON SCHEMA public TO web_anon;

-- The ETL grants SELECT on the catalog/KB tables (and sets default privileges)
-- after it creates them, so PostgREST only ever exposes read-only catalog data
-- — never the CRM tables (leads, conversations, orders).
