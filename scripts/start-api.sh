#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/../backend"
if command -v dotnet >/dev/null 2>&1; then
  exec dotnet run
elif [ -n "${DOTNET_ROOT:-}" ] && [ -x "$DOTNET_ROOT/dotnet" ]; then
  exec "$DOTNET_ROOT/dotnet" run
elif [ -x /private/tmp/om-dotnet/dotnet ]; then
  # Temporary SDK used to verify the demo in the development environment.
  export DOTNET_CLI_HOME=/private/tmp/om-dotnet-home
  exec /private/tmp/om-dotnet/dotnet run
else
  echo 'Install the .NET 10 SDK or set DOTNET_ROOT to its directory.' >&2
  exit 1
fi
