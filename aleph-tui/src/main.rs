use clap::{Parser, Subcommand};
use oxigraph::store::Store;
use std::net::SocketAddr;

#[derive(Parser)]
#[command(name = "aleph-tui")]
#[command(about = "Aleph Wiki TUI utilities", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Start a local SPARQL endpoint using Oxigraph
    Sparql {
        /// Port to bind the server to
        #[arg(short, long, default_value = "7878")]
        port: u16,

        /// Host to bind the server to
        #[arg(long, default_value = "127.0.0.1")]
        host: String,

        /// Data directory for Oxigraph storage
        #[arg(short, long, default_value = "./data/oxigraph")]
        data_dir: String,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Sparql { port, host, data_dir } => {
            println!("Starting Oxigraph SPARQL server...");
            println!("Data directory: {}", data_dir);

            // Create the store
            let store = Store::open(&data_dir)?;

            let addr: SocketAddr = format!("{}:{}", host, port).parse()?;
            println!("SPARQL endpoint: http://{}/query", addr);
            println!("Server running at http://{}", addr);

            // Start the HTTP server
            oxigraph::server::Server::new(store)
                .bind(addr)?
                .serve()
                .await?;

            Ok(())
        }
    }
}
