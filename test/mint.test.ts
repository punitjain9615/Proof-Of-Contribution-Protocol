import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
const { assert, expect } = require("chai");

describe("POCP", function () {
  let pocpProxy: Contract;
  let owner: { address: any };
  let addr1: { address: any };
  let addr2: { address: any };
  beforeEach(async function () {
    const POCP = await ethers.getContractFactory("POCP");
    pocpProxy = await upgrades.deployProxy(POCP, { kind: "uups" });
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("deployment", async function () {
    it("deploys successfully", async function () {
      const address = pocpProxy.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      expect(await pocpProxy.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe("minting", async function () {
    it("mints tokens as expected", async function () {
      await pocpProxy.mint(
        3,
        [
          "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
          "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
          "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
        ],
        [owner.address, addr1.address, addr2.address],
        {
          value: ethers.utils.parseEther("0.15"),
        }
      );
      const totalSupply = await pocpProxy.totalSupply();
      assert.equal(totalSupply, 3);
      expect(await pocpProxy.balanceOf(owner.address)).to.equal(1);
      expect(await pocpProxy.balanceOf(addr1.address)).to.equal(1);
      expect(await pocpProxy.balanceOf(addr2.address)).to.equal(1);
    });
  });
});
