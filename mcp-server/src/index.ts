#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Config } from "./lib/config.js";
import {
  setSolidSession,
  initializeSolidSession,
  readRdfResource,
  appendTriples,
  listContainer,
} from "./lib/solid-client.js";
import { sparqlMatch, executeSparqlQuery } from "./lib/sparql.js";
import {
  solidInitTool,
  handleSolidInit,
  rdfReadTool,
  handleRdfRead,
  rdfAppendTool,
  handleRdfAppend,
  sparqlMatchTool,
  handleSparqlMatch,
  sparqlQueryTool,
  handleSparqlQuery,
  solidListTool,
  handleSolidList,
} from "./lib/tools/index.js";

/**
 * MCP Server for Solid Pod RDF Operations
 *
 * Provides tools for:
 * - SPARQL queries against Solid Pods
 * - Reading RDF resources
 * - Writing/appending triples
 * - Managing ontologies
 */

// Re-export for backward compatibility
export type { Config };
export {
  setSolidSession,
  initializeSolidSession,
  readRdfResource,
  appendTriples,
  listContainer,
  sparqlMatch,
  executeSparqlQuery,
};

/**
 * Register all MCP tools on the server
 *
 * Registers the following tools for Solid Pod operations:
 * - solid_init: Initialize Solid session with authentication
 * - rdf_read: Read RDF resources from Solid Pods
 * - rdf_append: Append RDF triples to resources
 * - sparql_match: Pattern matching for RDF triples
 * - sparql_query: Execute full SPARQL queries
 * - solid_list: List resources in Solid containers
 *
 * @param server - The MCP Server instance to register tools on
 */
export function registerTools(server: Server) {
  // Collect all tool definitions from tool modules
  const tools = [
    solidInitTool,
    rdfReadTool,
    rdfAppendTool,
    sparqlMatchTool,
    sparqlQueryTool,
    solidListTool,
  ];

  // Register ListToolsRequestSchema handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  // Register CallToolRequestSchema handler with tool dispatch
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments;

    switch (toolName) {
      case 'solid_init':
        return handleSolidInit(args as any);
      case 'rdf_read':
        return handleRdfRead(args as any);
      case 'rdf_append':
        return handleRdfAppend(args as any);
      case 'sparql_match':
        return handleSparqlMatch(args as any);
      case 'sparql_query':
        return handleSparqlQuery(args as any);
      case 'solid_list':
        return handleSolidList(args as any);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  });
}

/**
 * Main MCP Server
 */
async function main() {
  const server = new Server({
    name: "aleph-wiki-solid",
    version: "0.1.0",
  });

  // Register tools
  registerTools(server);

  // Start server on stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Aleph.wiki Solid MCP Server running on stdio");
}

// Only run main when executed directly (not when imported)
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
