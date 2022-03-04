import { signMetaTxRequest } from "../src/signer";
import { LazyMinter } from "../src/lazy_minter";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { ethers, upgrades } from "hardhat";
const { assert, expect } = require("chai");

describe("POCP", function () {
  let pocpProxy: Contract;
  let pocp: ContractFactory;
  let trustedForwarder: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  beforeEach(async function () {
    pocp = await ethers.getContractFactory("POCP");
    const trustedForwarderContract = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    trustedForwarder = await trustedForwarderContract.deploy();
    pocpProxy = await upgrades.deployProxy(pocp, [trustedForwarder.address], {
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

  describe("successful_claim", async function () {
    it("mints tokens as expected", async function () {
      const lazyMinter = new LazyMinter({ contract: pocpProxy, signer: owner });
      const voucher = await lazyMinter.createVoucher(
        1,
        "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        addr1.address
      );

      console.log(signMetaTxRequest);
      const { request, signature } = await signMetaTxRequest(
        owner.provider,
        trustedForwarder,
        {
          from: addr1.address,
          to: pocpProxy.address,
          data: pocpProxy.interface.encodeFunctionData("claim", [voucher]),
        }
      );
      await trustedForwarder
        .execute(request, signature, {
          value: ethers.utils.parseEther("0.15"),
        })
        .then((tx: any) => tx.wait());

      const totalSupply = await pocpProxy.totalSupply();
      assert.equal(totalSupply, 1);
      expect(await pocpProxy.balanceOf(owner.address)).to.equal(0);
      expect(await pocpProxy.balanceOf(addr1.address)).to.equal(1);
      expect(await pocpProxy.balanceOf(addr2.address)).to.equal(0);
    });
  });

  describe("unsuccessful_claim", async function () {
    it("mints tokens as expected", async function () {
      const lazyMinter = new LazyMinter({ contract: pocpProxy, signer: owner });
      const voucher = await lazyMinter.createVoucher(
        1,
        "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        addr2.address
      );

      console.log(signMetaTxRequest);
      const { request, signature } = await signMetaTxRequest(
        owner.provider,
        trustedForwarder,
        {
          from: addr1.address,
          to: pocpProxy.address,
          data: pocpProxy.interface.encodeFunctionData("claim", [voucher]),
        }
      );
      await trustedForwarder
        .execute(request, signature, {
          value: ethers.utils.parseEther("0.15"),
        })
        .then((tx: any) => tx.wait());

      const totalSupply = await pocpProxy.totalSupply();
      assert.equal(totalSupply, 0);
      expect(await pocpProxy.balanceOf(owner.address)).to.equal(0);
      expect(await pocpProxy.balanceOf(addr1.address)).to.equal(0);
      expect(await pocpProxy.balanceOf(addr2.address)).to.equal(0);
    });
  });
});
