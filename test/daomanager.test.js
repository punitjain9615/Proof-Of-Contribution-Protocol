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
    it("Should Deploy the pocp", async()=>{
        assert.notEqual(pocp.address, null);
        assert.notEqual(pocp.address, undefined);
        assert.notEqual(pocp.address, "");
        assert.notEqual(pocp.address, "0x0000000000000000000000000000000000000000");
        console.log("pocp depoyed at", pocp.address);
    });

    it("Should register for DAO", async()=>{
        let uuid1 = await pocp.register("Etherium");
        let uuid2 = await pocp.register("Etherium 2.0");

        assert.equal(await pocp.getDaoName(0), "Etherium");
        assert.equal(await pocp.getDaoName(1), "Etherium 2.0");

        console.log("Uuid for iD 0:", await pocp.getDaoUuid(0));
        console.log("Uuid for iD 1:", await pocp.getDaoUuid(1));  
    });
});