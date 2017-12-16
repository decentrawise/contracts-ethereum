module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4612388
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      from: "0x161E92E2801BFC62E9F890ff2528F4aB11D7756E",
      network_id: 4,
      gas: 4612388
    }
  }
};
