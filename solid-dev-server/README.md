# Solid Dev Server

Development environment for running Community Solid Server (CSS) with Oxigraph SPARQL backend.

## Quick Start

Using devenv from the repository root:

```bash
# From repository root
nix develop
devenv up
```

This will start both Oxigraph and CSS as background services.

## Manual Start

```bash
# Terminal 1: Start Oxigraph
bun run oxigraph

# Terminal 2: Start CSS
bun run solid
```

## Configuration

- **CSS Config**: `config/css-seeded-pods.json`
- **Seeded Pod**: dev@localhost / dev123
- **WebID**: http://localhost:3000/dev/profile/card#me
- **Pod URL**: http://localhost:3000/dev/

## Documentation

- [SOLID_SETUP.md](./SOLID_SETUP.md) - Initial setup and configuration
- [SOLID_CREDENTIALS.md](./SOLID_CREDENTIALS.md) - Authentication and credentials
- [SOLID_INTEGRATION.md](./SOLID_INTEGRATION.md) - Integration guide
- [README.solid.md](./README.solid.md) - Additional Solid protocol information

## Services

### Oxigraph
- **Port**: 7878
- **Query Endpoint**: http://localhost:7878/query
- **Update Endpoint**: http://localhost:7878/update
- **Data**: `data/.oxigraph-data/`

### Community Solid Server
- **Port**: 3000
- **Root**: http://localhost:3000/
- **Account API**: http://localhost:3000/.account/
- **Data**: `data/.solid-data/`
- **SPARQL Backend**: Uses Oxigraph at http://localhost:7878/query

## Client Credentials

Generate client credentials for testing:

```bash
./get-credentials.sh
```

Or using the Nix app:

```bash
nix run .#get-credentials
```

## Data Storage

Both services store data in the `data/` directory:

- `data/.oxigraph-data/` - Oxigraph RDF database
- `data/.solid-data/` - CSS metadata and ACLs

To reset:

```bash
rm -rf data/.oxigraph-data data/.solid-data
```

## Dependencies

Provided by Nix flake or installed via bun:

- `oxigraph` - SPARQL 1.1 database
- `@solid/community-server@7` - Solid server implementation
- `bun` - JavaScript runtime
