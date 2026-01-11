{
  description = "Aleph Wiki - Knowledge graph with Solid Protocol and SPARQL";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devenv.url = "github:cachix/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs @ { flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];

      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];

      perSystem = { config, self', inputs', pkgs, system, lib, ... }: {
        devenv.shells.default = {
          name = "aleph-wiki";

          packages = with pkgs; [
            bun
            oxigraph
            jq
            curl
          ];

          processes = {
            # Oxigraph SPARQL server
            oxigraph = {
              exec = "oxigraph serve --location solid-dev-server/data/.oxigraph-data --bind 127.0.0.1:7878";
            };

            # Community Solid Server (runs via bunx)
            solid = {
              exec = ''
                cd solid-dev-server && \
                bun x -y @solid/community-server@7 \
                  -c @css:config/sparql-file-storage.json \
                  -f data/.solid-data/ \
                  -p 3000 \
                  --sparqlEndpoint http://localhost:7878/query \
                  --seedConfig config/css-seeded-pods.json
              '';
            };
          };

          scripts = {
            get-credentials = {
              description = "Generate Solid Pod client credentials";
              exec = ''
                cd solid-dev-server
                ./get-credentials.sh
              '';
            };

            reset-data = {
              description = "Clear all Solid and Oxigraph data";
              exec = ''
                echo "Clearing Solid and Oxigraph data..."
                rm -rf solid-dev-server/data/.oxigraph-data
                rm -rf solid-dev-server/data/.solid-data
                echo "Data cleared. Restart services to reinitialize."
              '';
            };
          };

          enterShell = ''
            echo ""
            echo "🌐 Aleph Wiki Development Environment"
            echo "======================================"
            echo ""
            echo "Services:"
            echo "  • Oxigraph SPARQL:  http://localhost:7878"
            echo "  • Solid Server:     http://localhost:3000"
            echo ""
            echo "Commands:"
            echo "  • devenv up         - Start all services in background"
            echo "  • get-credentials   - Generate Solid client credentials"
            echo "  • reset-data        - Clear all data and reinitialize"
            echo ""
            echo "Projects:"
            echo "  • app/              - RDF Graph Viewer (Vite app)"
            echo "  • mcp-server/       - MCP server for Solid/SPARQL"
            echo "  • solid-dev-server/ - Solid + Oxigraph dev environment"
            echo "  • agent/            - Claude agent experiments"
            echo ""
          '';
        };

        # Development shells for individual projects
        devShells = {
          # App-specific shell (Vite + RDF viewer)
          app = pkgs.mkShell {
            buildInputs = with pkgs; [ bun ];
            shellHook = ''
              echo "RDF Graph Viewer development environment"
              cd app
            '';
          };

          # MCP server shell
          mcp = pkgs.mkShell {
            buildInputs = with pkgs; [ bun ];
            shellHook = ''
              echo "MCP Server development environment"
              cd mcp-server
            '';
          };

          # Solid dev server shell
          solid = pkgs.mkShell {
            buildInputs = with pkgs; [ bun oxigraph ];
            shellHook = ''
              echo "Solid Dev Server environment"
              cd solid-dev-server
            '';
          };
        };
      };
    };
}
