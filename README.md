# MedChain IDO Smart Contracts

This repository contains the smart contracts for MedChain's IDO (Initial DEX Offering) sale, where MCH tokens can be purchased using NAIRA stable tokens.

## Overview

The system consists of three main contracts:

- [`MCH.sol`](contracts/MCH.sol): The MedChain (MCH) ERC20 token
- [`NAIRA.sol`](contracts/NAIRA.sol): A stable token used for purchases 
- [`IDOSaleNaira.sol`](contracts/IDOSaleNaira.sol): The IDO sale contract

## Contract Details

### MCH Token
- Symbol: MCH
- Name: MedChain Token
- Decimals: 18
- Initial Supply: 1,000,000,000 MCH
- Features: Mintable by owner

### NAIRA Token
- Symbol: NAIRA
- Name: NAIRA Stable Token
- Decimals: 18
- Initial Supply: 1,000,000,000 NAIRA
- Features: Mintable by owner

### IDO Sale
- Price: 2.5 NAIRA per 1 MCH
- Total Allocation: 200,000,000 MCH
- Duration: 7 days
- Features:
  - Purchase MCH using NAIRA tokens
  - Owner can withdraw collected NAIRA
  - Owner can withdraw unsold MCH after sale ends

## Development

### Prerequisites

- Node.js
- npm or yarn
- Hardhat

### Setup

1. Install dependencies:
```sh
npm install
```

2. Copy `.env.sample` to `.env` and fill in your values:
```sh
cp .env.sample .env
```

3. Configure your environment variables:
- `SEPOLIA_RPC_URL`: Sepolia testnet RPC URL
- `PRIVATE_KEY`: Your deployment wallet private key
- `ETHERSCAN_API_KEY`: For contract verification

### Testing

Run the test suite:
```sh
npx hardhat test
```

### Deployment

Deploy to Sepolia testnet:
```sh
npx hardhat run scripts/deploy.js --network sepolia
```

## Security

- Contracts use OpenZeppelin's battle-tested implementations
- ReentrancyGuard protection on critical functions
- Owner privileges limited to token minting and fund withdrawal
- Full test coverage

## License

MIT