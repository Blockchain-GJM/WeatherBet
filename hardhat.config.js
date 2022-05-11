require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "Huygens_dev",
  networks: {
    Huygens_dev: {
      url: "http://18.182.45.18:8765/",
      accounts: [
        "25105916E725D7ECC48D7B719C4E79457A49BE4A744B27AB5D545C9939D03871"
      ]
    },
    Huygens: {
      url: "http://13.212.177.203:8765",
      accounts: [
        "25105916E725D7ECC48D7B719C4E79457A49BE4A744B27AB5D545C9939D03871"
      ]
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}
