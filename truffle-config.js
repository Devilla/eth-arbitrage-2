require('babel-register');
require('babel-polyfill');
module.exports = {
  networks: {
    dev: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: 0x2e0d45a887c8120d7bc6a3d06aec5214270902ba,
      gas: 8500000,
      gasPrice: 2000000000
    },
    loc_ronnie_ronnie: {
      network_id: "*",
      port: 3001,
      host: "127.0.0.1",
      from: 0x2e0d45a887c8120d7bc6a3d06aec5214270902ba,
      gas: 8500000,
      gasPrice: 2000000000
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.0",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
};
