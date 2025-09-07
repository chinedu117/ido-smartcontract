import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const parseEther = (n: string | number): bigint => ethers.parseUnits(n.toString(), 18);

export default buildModule("IdoSaleModule", async (m) => {
  // Deploy NAIRA token first
  const naira = m.contract("NAIRA", [parseEther("1_000_000_000")], {
    id: "naira-token",
    from: m.getAccount(0)
  });

  // Deploy MCH token
  const mch = m.contract("MCH", [parseEther("1_000_000_000")], {
    id: "mch-token",
    from: m.getAccount(0)
  });

  // Get block timestamp for start/end times
  const now = Math.floor(Date.now() / 1000);
  const startTime = BigInt(now + 3600); // Start in 1 hour
  const endTime = BigInt(now + (365 * 24 * 3600)); // End in 365 days

  // Deploy IDO Sale contract
  const idoSale = m.contract("IdoSaleNaira", [
    m.getAddress(mch),
    m.getAddress(naira),
    parseEther("2.5"), // Price: 2.5 NAIRA per MCH
    startTime,
    endTime,
    parseEther("200000000") // 200M MCH for sale
  ], {
    id: "ido-sale",
    from: m.getAccount(0)
  });

  // Transfer MCH allocation to IDO contract
  const transferMCH = m.call(mch, "transfer", [
    m.getAddress(idoSale),
    parseEther("200000000")
  ], {
    id: "transfer-mch-to-ido"
  });

  return {
    naira,
    mch,
    idoSale,
    transferMCH
  };
});