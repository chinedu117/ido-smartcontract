const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Utility
  const parse = (n) => hre.ethers.utils.parseUnits(n, 18);

  // 1) Deploy NAIRA (1,000,000,000)
  const NairaFactory = await hre.ethers.getContractFactory("NAIRA");
  const nairaSupply = parse("1000000000"); // 1,000,000,000 NAIRA
  const naira = await NairaFactory.deploy(nairaSupply);
  await naira.deployed();
  console.log("NAIRA deployed to:", naira.address);

  // 2) Deploy MCH (1,000,000,000)
  const MchFactory = await hre.ethers.getContractFactory("MCH");
  const mchSupply = parse("1000000000"); // 1,000,000,000 MCH
  const mch = await MchFactory.deploy(mchSupply);
  await mch.deployed();
  console.log("MCH deployed to:", mch.address);

  // 3) Deploy IdoSaleNaira
  // Token price: ₦2.5 per 1 MCH — represented in NAIRA wei (2.5 * 1e18)
  const tokenPrice = parse("2.5"); // NAIRA wei per 1 MCH (wei)
  const now = Math.floor(Date.now() / 1000);
  const start = now + 60; // start in 60s
  const end = now + 60 * 60 * 24 * 7; // 7 days
  const totalForSale = parse("200000000"); // 200,000,000 MCH (IDO allocation)

  const IdoFactory = await hre.ethers.getContractFactory("IdoSaleNaira");
  const ido = await IdoFactory.deploy(
    mch.address,
    naira.address,
    tokenPrice,
    start,
    end,
    totalForSale
  );
  await ido.deployed();
  console.log("IDO deployed to:", ido.address);

  // 4) Transfer MCH tokens for sale to the IDO contract
  console.log("Transferring IDO allocation to IDO contract...");
  const tx = await mch.transfer(ido.address, totalForSale);
  await tx.wait();
  console.log("Transferred", totalForSale.toString(), "MCH to IDO.");

  // 5) Mint some NAIRA to a test buyer (optional) - deployer already has supply. Example: transfer 10,000 NAIRA to test buyer
  // const buyer = "0x..."; // set buyer address if needed
  // await naira.transfer(buyer, parse("10000"));

  console.log("Deployment complete.");
  console.log("Summary:");
  console.log("NAIRA:", naira.address);
  console.log("MCH:", mch.address);
  console.log("IDO:", ido.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
