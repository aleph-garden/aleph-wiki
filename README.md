# Aleph Wiki

Knowledge graph with Solid Protocol and SPARQL backend.

## Quick Start

### Using Nix with devenv

```bash
# Enter development shell
nix develop --impure

# Start all services (Oxigraph + Community Solid Server)
devenv up
```

**Note**: The `--impure` flag is required for devenv to create its local state directory.

### Manual Setup

```bash
# Install dependencies
cd solid-dev-server
bun install

# Terminal 1: Start Oxigraph
bun run oxigraph

# Terminal 2: Start Community Solid Server
bun run solid
```

## Project Structure

```
aleph-wiki/
├── app/                    # RDF Graph Viewer (Vite + D3.js)
├── mcp-server/            # MCP server for Solid/SPARQL integration
├── solid-dev-server/      # Community Solid Server + Oxigraph setup
├── agent/                 # Claude agent experiments
└── flake.nix              # Nix development environment
```

## Services

When running with `devenv up`, the following services start automatically:

- **Oxigraph SPARQL**: http://localhost:7878
  - Query endpoint: http://localhost:7878/query
  - Update endpoint: http://localhost:7878/update

- **Community Solid Server**: http://localhost:3000
  - Account dashboard: http://localhost:3000/.account/
  - Dev pod: http://localhost:3000/dev/
  - WebID: http://localhost:3000/dev/profile/card#me

### Default Credentials

- **Email**: dev@localhost
- **Password**: dev123
- **Pod**: http://localhost:3000/dev/

See [solid-dev-server/SOLID_CREDENTIALS.md](solid-dev-server/SOLID_CREDENTIALS.md) for details.

## Development Commands

In the devenv shell:

```bash
devenv up           # Start all services in background
get-credentials     # Generate Solid client credentials
reset-data          # Clear all data and reinitialize
```

## Running Tests

```bash
# MCP server tests
cd mcp-server
bun test

# E2E tests (requires running CSS)
bun test:e2e

# App tests
cd app
bun test
```

## Documentation

- [Solid Setup](solid-dev-server/SOLID_SETUP.md)
- [Credentials Guide](solid-dev-server/SOLID_CREDENTIALS.md)
- [E2E Tests](mcp-server/test/e2e/RUNNING.md)
