import { signMetaTxRequest } from "../src/signer";
import { LazyMinter } from "../src/lazy_minter";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";
import { ethers, upgrades } from "hardhat";
// import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
const { assert, expect } = require("chai");

describe("POCP", function () {
  let pocpProxy: Contract;
  let pocp: ContractFactory;
  let trustedForwarder: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  // let deployProxyOpts: DeployProxyOptions;
  beforeEach(async function () {
    pocp = await ethers.getContractFactory("POCP");
    const pocp = await ethers.getContractFactory("POCP");
    const trustedForwarderContract = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    trustedForwarder = await trustedForwarderContract.deploy();
    console.log("deployed forwarder");
    pocpProxy = await upgrades.deployProxy(pocp, [trustedForwarder.address], {
      kind: "uups",
      // pollingInterval: 300000,
    });
    console.log("deployed pocp");
    [owner, addr1, addr2] = await ethers.getSigners();
    expect(await pocpProxy.getTrustedForwarder()).to.equal(
      trustedForwarder.address
    );
    console.log(owner.address, addr1.address, addr2.address);
    console.log(pocpProxy.address, trustedForwarder.address);
  });

  // describe("deployment", async function () {
  //   it("deploys successfully", async function () {
  //     const address = pocpProxy.address;
  //     assert.notEqual(address, 0x0);
  //     assert.notEqual(address, "");
  //     assert.notEqual(address, null);
  //     assert.notEqual(address, undefined);
  //     expect(await pocpProxy.balanceOf(owner.address)).to.equal(0);
  //   });
  // });

  describe("successful_claim", async function () {
    it("mints tokens as expected", async function () {
      const lazyMinter = new LazyMinter({ contract: pocpProxy, signer: owner });
      // console.log(owner);
      const lazyMinter = new LazyMinter({ contract: pocpProxy, signer: owner });
      console.log("creating voucher................");
      console.log(addr1.address);
      const voucher = await lazyMinter.createVoucher(
        1,
        "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        addr1.address
      );

      console.log(signMetaTxRequest);
      const forwarder = trustedForwarder.connect(addr1);
      // console.log(addr1.provider);
      console.log("signing..............");
      const { request, signature } = await signMetaTxRequest(
        addr1.provider,
        forwarder,
        {
          from: addr1.address,
          to: pocpProxy.address,
          data: pocpProxy.interface.encodeFunctionData("claim", [voucher]),
        }
      );
      await forwarder.verify(request, signature).catch((e: any) => {
        console.log(e);
      });
      // if (!valid) throw new Error(`Invalid request`);
      await forwarder
        .execute(request, signature, { value: ethers.utils.parseEther("0.75") })
        .then((tx: any) => tx.wait())
        .catch((error: any) => {
          console.log(error);
        });
      console.log("forwarded request");
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

  // describe("unsuccessful_claim", async function () {
  //   it("mints tokens as expected", async function () {
  //     const lazyMinter = new LazyMinter({ contract: pocpProxy, signer: owner });
  //     const voucher = await lazyMinter.createVoucher(
  //       1,
  //       "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  //       addr2.address
  //     );
  //     const { request, signature } = await signMetaTxRequest(
  //       owner.provider,
  //       trustedForwarder,
  //       {
  //         from: addr1.address,
  //         to: pocpProxy.address,
  //         data: pocpProxy.interface.encodeFunctionData("claim", [voucher]),
  //       }
  //     );
  //     console.log(signMetaTxRequest);
  //     await trustedForwarder
  //       .execute(request, signature, {
  //         value: ethers.utils.parseEther("0.15"),
  //       })
  //       .then((tx: any) => tx.wait());

  //     const totalSupply = await pocpProxy.totalSupply();
  //     assert.equal(totalSupply, 0);
  //     expect(await pocpProxy.balanceOf(owner.address)).to.equal(0);
  //     expect(await pocpProxy.balanceOf(addr1.address)).to.equal(0);
  //     expect(await pocpProxy.balanceOf(addr2.address)).to.equal(0);
  //   });
  // });
});