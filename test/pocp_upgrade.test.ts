import { ethers, upgrades } from "hardhat";

describe("POCP Upgrade", function () {
  it("deploys and upgrades", async function () {
    const [owner] = await ethers.getSigners();
    console.log(owner);
    const POCP = await ethers.getContractFactory("POCP");
    const trustedForwarderContract = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    const trustedForwarder = await trustedForwarderContract.deploy();
    const proxy = await upgrades.deployProxy(POCP, [trustedForwarder.address], {
      kind: "uups",
    });

    // console.log(proxy.address);

    // const [owner] = await ethers.getSigners();
    // console.log(owner);
    // const owner = await proxy.owner();

    console.log("Owner = ", owner.address);
    console.log(
      "Owner Balance in V1 = ",
      (await proxy.balanceOf(owner.address)).toString()
    );

    const V2 = await ethers.getContractFactory("POCPv2");
    const proxy2 = await upgrades.upgradeProxy(proxy, V2);

    // console.log(proxy2.address);

    console.log(
      "Owner Balance in V2 = ",
      (await proxy2.balanceOf(owner.address)).toString()
    );
    console.log(
      "New value existing only in V2 before being initialized = ",
      await proxy2.getWhatever()
    );
    await proxy2.setWhatever("0x1111111111111111111111111111111111111111");
    console.log(
      "New value existing only in V2 after being initialized  = ",
      await proxy2.getWhatever()
    );
    console.log("Total supply ", (await proxy2.totalSupply()).toString());
  });
});