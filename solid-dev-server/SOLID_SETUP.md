# Solid Development Setup

This setup provides Solid protocol compatibility with SPARQL querying via Comunica.

## What's Installed

- **Oxigraph**: Fast SPARQL database backend (Rust-based, via Nix)
- **Community Solid Server (CSS)**: Local Solid pod server with hybrid storage (runs via npx)
- **Comunica**: Browser-compatible SPARQL query engine (@comunica/query-sparql v3.x)
- **Concurrently**: Run all services together
- **N3**: RDF parsing and serialization library

## Quick Start

```bash
nix develop  # Load Oxigraph into environment
bun run dev:all
```

This starts:
- **Oxigraph SPARQL database**: http://localhost:7878/
- **Solid pod server (CSS)**: http://localhost:3000/
- **Vite dev server**: http://localhost:5173/

## Individual Commands

```bash
bun run dev       # Just Vite
bun run oxigraph  # Just Oxigraph
bun run solid     # Just CSS (requires Oxigraph running)
```

## Architecture

### Hybrid Storage with Oxigraph

CSS now uses **hybrid storage**:
- **Internal data** (accounts, configs): File-based storage (`.solid-data/`)
- **Pod RDF data**: Oxigraph SPARQL backend (`.oxigraph-data/`)

This gives you:
- Simple account management
- Fast SPARQL queries on pod data
- Native triple store for RDF operations

### CSS via npx (Separate Installation)

CSS runs via `npx` to avoid dependency conflicts with Comunica. This means:
- CSS runs in its own isolated environment
- No version conflicts between CSS's internal Comunica (v2.x) and your app's Comunica (v3.x)
- First run downloads CSS automatically (subsequent runs are instant)

### Comunica for SPARQL Queries

Comunica (@comunica/query-sparql) is a **JavaScript SPARQL engine** that:
- Runs in the browser or Node.js
- Queries HTTP URLs, file:// URLs, and SPARQL endpoints
- Can query ANY RDF data source including Solid pods
- Evaluates queries client-side (works even without server-side SPARQL)

### How It Works

```
Your App (Comunica)
    ├─→ Your Local Pod (CSS at localhost:3000)
    ├─→ Friend's Pod (any Solid server)
    ├─→ Public Pods (any Solid server)
    └─→ Any pod on the web
```

Comunica fetches RDF documents from pods and evaluates SPARQL locally, so it doesn't matter if the remote pod has SPARQL support.

## Performance with Large Datasets

With Oxigraph as the SPARQL backend, you get:
- Native triple store performance for RDF operations
- Fast indexed queries on your pod data
- SPARQL 1.1 Query and Update support
- Persistent storage with RocksDB

Comunica (for federated queries) includes:
- Smart caching and memoization
- Parallel query execution across sources
- Adaptive query optimization
- Link traversal for federated queries

## Example Usage

See `src/comunica-example.js` for:
- Basic SPARQL queries
- Multi-pod queries
- Authenticated queries
- CONSTRUCT/ASK queries

## Data Persistence

- Oxigraph RDF triples: `.oxigraph-data/` (gitignored)
- CSS internal data: `.solid-data/` (gitignored)
- Data persists between restarts

## Next Steps

1. Start the stack with `nix develop` then `bun run dev:all`
2. Access Oxigraph UI at http://localhost:7878 to run SPARQL queries
3. Check out the Comunica examples in `src/comunica-example.js`
4. Integrate SPARQL queries into your RDF graph viewer
5. Test with real Solid pods when ready
