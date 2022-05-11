const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = require('./secrets.json').privateKey; // need to manually add; not tracked by git (see .gitignore)

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8765,            // Standard Huygen port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    huygens: {
      provider: () => new HDWalletProvider([privateKey], `https://huygens.computecoin.network/`), // different from doc; updated per discord
      network_id: 828, // different from doc; updated after the above line 
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.0", // A version or constraint - Ex. "^0.8.0"
    }
  }
}