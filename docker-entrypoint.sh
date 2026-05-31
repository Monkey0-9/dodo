#!/bin/sh
set -e

# Default to "postgres" if no command given
if [ "$#" -eq 0 ]; then
    set -- postgres
fi

# If command is "postgres", start PostgreSQL
if [ "$1" = "postgres" ]; then
    exec postgres "$@"
fi

# For any other command, execute it
exec "$@"
