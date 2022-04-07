const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = "entry square blur cat list force thank consider zero holiday sphere fox";
module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      port: 7545,
      host: "127.0.0.1",
      // port: 7545,
      network_id: "1337", // Match any network id
      from: "0x274De732634f03e4b1a15AFed69bc20Def50ac23"
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/c34a3f8948d94c14a0d21214111ad5ee`),
      network_id: 4,       // goerli's id
      gas: 5500000,        
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,    // Skip dry run before migrations? (default: false for public nets )
      from: '0xe6Ab05514056e56EE0fAF9Fa01f8701860B3910b'    
    }
  },
  // compilers: {
  //   solc: {
  //     version: '0.5.12',
  //     optimizer: {
  //       enabled: true,
  //       runs: 200
  //     }
  //   }
  // }
};
