import { signMetaTxRequest } from "../src/signer";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
const { assert, expect } = require("chai");

describe("POCP", function () {
  let pocpProxy: Contract;
  let trustedForwarder: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  beforeEach(async function () {
    const POCP = await ethers.getContractFactory("POCP");
    const trustedForwarderContract = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    trustedForwarder = await trustedForwarderContract.deploy();
    pocpProxy = await upgrades.deployProxy(POCP, [trustedForwarder.address], {
      kind: "uups",
    });
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
      console.log(signMetaTxRequest);
      const { request, signature } = await signMetaTxRequest(
        owner.provider,
        trustedForwarder,
        {
          from: owner.address,
          to: pocpProxy.address,
          data: pocpProxy.interface.encodeFunctionData("mint", [
            3,
            [
              "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
              "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
              "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
            ],
            [owner.address, addr1.address, addr2.address],
          ]),
        }
      );
      await trustedForwarder
        .execute(request, signature, {
          value: ethers.utils.parseEther("0.15"),
        })
        .then((tx: any) => tx.wait());

      const totalSupply = await pocpProxy.totalSupply();
      assert.equal(totalSupply, 3);
      expect(await pocpProxy.balanceOf(owner.address)).to.equal(1);
      expect(await pocpProxy.balanceOf(addr1.address)).to.equal(1);
      expect(await pocpProxy.balanceOf(addr2.address)).to.equal(1);
    });
  });
});
