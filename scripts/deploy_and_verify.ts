const { ethers, upgrades } = require("hardhat");
// const hre = require("hardhat");
console.log(upgrades);
// const sleep = require("sleep");

async function main() {
  const POCP = await ethers.getContractFactory("POCP");
  const proxy = await upgrades.deployProxy(POCP, { kind: "uups" });
  console.log("UUPS deployed: ", proxy.address);

  //   sleep.sleep(15);

  //   await hre.run("verify:verify", {
  //     address: proxy.address,
  //   });
}

main();