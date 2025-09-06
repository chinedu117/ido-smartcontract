const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdoSaleNaira", function () {
  let deployer, buyer, other;
  let NAIRA, MCH, IDO;
  let naira, mch, ido;

  const parse = (n) => ethers.utils.parseUnits(n.toString(), 18);

  beforeEach(async () => {
    [deployer, buyer, other] = await ethers.getSigners();

    // Deploy NAIRA
    NAIRA = await ethers.getContractFactory("NAIRA");
    naira = await NAIRA.deploy(parse("1000000000"));
    await naira.deployed();

    // Deploy MCH
    MCH = await ethers.getContractFactory("MCH");
    mch = await MCH.deploy(parse("1000000000"));
    await mch.deployed();

    // Deploy IDO
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = now + 1; // start soon
    const end = now + 60 * 60 * 24; // 1 day
    const price = parse("2.5"); // 2.5 NAIRA per 1 MCH
    const allocation = parse("200000000");

    const Ido = await ethers.getContractFactory("IdoSaleNaira");
    ido = await Ido.deploy(mch.address, naira.address, price, start, end, allocation);
    await ido.deployed();

    // Transfer allocation to IDO contract
    await mch.transfer(ido.address, allocation);

    // Give buyer NAIRA
    await naira.transfer(buyer.address, parse("10000"));
  });

  it("should deploy with correct parameters", async () => {
    expect(await ido.mchToken()).to.equal(mch.address);
    expect(await ido.nairaToken()).to.equal(naira.address);
    expect(await ido.tokenPrice()).to.equal(parse("2.5"));
  });

  it("buyer can purchase MCH with NAIRA", async () => {
    const amountToSpend = parse("2.5"); // 2.5 NAIRA
    await naira.connect(buyer).approve(ido.address, amountToSpend);

    // Wait until IDO is active
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);

    await expect(ido.connect(buyer).buy(amountToSpend))
      .to.emit(ido, "Bought")
      .withArgs(buyer.address, amountToSpend, parse("1"));

    const mchBalance = await mch.balanceOf(buyer.address);
    expect(mchBalance).to.equal(parse("1"));

    const tokensSold = await ido.tokensSold();
    expect(tokensSold).to.equal(parse("1"));
  });

  it("should fail if not active yet", async () => {
    const amountToSpend = parse("2.5");
    await naira.connect(buyer).approve(ido.address, amountToSpend);

    await expect(ido.connect(buyer).buy(amountToSpend)).to.be.revertedWith("IDO not active");
  });

  it("owner can withdraw NAIRA after purchases", async () => {
    const amountToSpend = parse("2.5");
    await naira.connect(buyer).approve(ido.address, amountToSpend);

    // fast-forward into sale
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);
    await ido.connect(buyer).buy(amountToSpend);

    await expect(ido.withdrawNaira())
      .to.emit(ido, "WithdrawNaira")
      .withArgs(deployer.address, amountToSpend);

    const bal = await naira.balanceOf(deployer.address);
    expect(bal).to.equal(parse("1000000000").sub(parse("10000")).add(amountToSpend));
  });

  it("owner can withdraw unsold MCH after IDO ends", async () => {
    // fast-forward beyond end
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 25]); // > 1 day
    await ethers.provider.send("evm_mine", []);

    const unsold = parse("200000000");
    await expect(ido.withdrawUnsoldMCH())
      .to.emit(ido, "WithdrawUnsoldMCH")
      .withArgs(deployer.address, unsold);

    const bal = await mch.balanceOf(deployer.address);
    expect(bal).to.equal(parse("1000000000").sub(parse("200000000")).add(unsold));
  });

  it("should not allow unsold MCH withdrawal before end", async () => {
    await expect(ido.withdrawUnsoldMCH()).to.be.revertedWith("IDO not ended");
  });
});
