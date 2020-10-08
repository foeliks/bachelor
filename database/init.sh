#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE IF NOT EXISTS test2 (
	    user_id serial PRIMARY KEY
    );
    INSERT INTO test2 VALUES (1), (2);
EOSQL
