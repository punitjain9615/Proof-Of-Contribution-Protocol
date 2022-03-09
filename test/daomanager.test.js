const{ ethers, upgrade} =  require("hardhat");
const{ expect, assert} = require("chai");

describe("Dao Manager", ()=>{
    let POCP, pocp;
    beforeEach(async()=>{
        POCP = await ethers.getContractFactory("POCP");
        pocp = await POCP.deploy();
        await pocp.deployed();
        [owner, add1, add2] = await ethers.getSigners();
    });
    it("Should Deploy the DAO", async()=>{
        assert.notEqual(pocp.address, null);
        assert.notEqual(pocp.address, undefined);
        assert.notEqual(pocp.address, "");
        assert.notEqual(pocp.address, "0x0000000000000000000000000000000000000000");
        console.log("DAO manager depoyed at", pocp.address);
    });
});