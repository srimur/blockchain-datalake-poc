# Blockchain DataLake PoC

A Proof-of-Concept for a blockchain-based data lake with fine-grained data access control, CSV ingestion, SQL query rewriting, and permission sharing via Ethereum smart contracts.

---

## Table of Contents

1. Features
2. Project Structure
3. Requirements
4. Environment Setup
5. Backend Setup
6. Frontend Setup
7. Deploying Smart Contract
8. Running the App
9. Folder and File Details

---

## Features

- Blockchain-based access control for datasets
- Fine-grained permissions: allowed columns, row filters, expiry, share rights
- CSV ingestion with automatic MinIO storage
- Query execution with SQL rewriting to enforce permissions
- Permission sharing and audit via smart contracts
- React frontend connected to MetaMask

---

## Requirements

- Node.js >= 18
- npm >= 9
- Ganache (or other Ethereum testnet)
- MetaMask browser extension
- MinIO server for storage
- SQLite3
- Hardhat

---

## Environment Setup

Create `.env` files in **backend/** and **frontend/**:

### Backend `.env`

PORT=4000
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
OWNER_PRIVATE_KEY=<GANACHE_OWNER_PRIVATE_KEY>
MINIO_HOST=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS=minioadmin
MINIO_SECRET=minioadmin

### Frontend `.env`

REACT_APP_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>

> You can leave placeholders in `.env` and push to GitHub safely. Fill actual values locally.

---

## Backend Setup

cd backend
npm install
node server.js

- Backend listens on `PORT` (default 4000)
- Provides endpoints for:
  - `/auth/nonce` and `/auth/verify`
  - `/data/ingest` (CSV upload)
  - `/query/execute`
  - `/data/share`
  - `/audit/events`

---

## Frontend Setup

cd frontend
npm install
npm start

- Connects via MetaMask
- Uses contract at `REACT_APP_CONTRACT_ADDRESS`
- Pages:
  - DataOwner
  - Query
  - SharingAudit

---

## Deploying Smart Contract

1. Compile with Hardhat:

npx hardhat compile
# Output example:
# Compiled 1 Solidity file successfully (evm target: paris)

2. Deploy to local Ganache:

npx hardhat run scripts/deploy.js --network localhost
# Note the deployed contract address

3. Copy the deployed contract address to your backend `.env` and frontend `.env` as `CONTRACT_ADDRESS` / `REACT_APP_CONTRACT_ADDRESS`

---

## Running the App

1. Start Ganache
2. Start backend: `node server.js` (listens on PORT)
3. Start frontend: `npm start` (React app connects via MetaMask)
4. Upload CSV datasets via frontend DataOwner page
5. Execute queries with permissions enforced
6. Share dataset access and view audit logs

---

## Folder and File Details

**backend/**
- server.js : Express API
- blockchainClient.js : Ethers.js client
- minioClient.js : MinIO wrapper
- sqliteClient.js : SQLite integration
- queryRewriter.js : SQL column + row filter enforcement
- uploads/ : temporary CSV uploads
- data.db : SQLite database
- scripts/deploy.js : Hardhat deploy script
- contracts/AccessControl.sol : Smart contract

**frontend/**
- src/
  - App.js : main React app
  - pages/
    - DataOwner.js
    - Query.js
    - SharingAudit.js
  - contracts/AccessControl.json : ABI from compilation

---

## Notes

- Ensure Ganache accounts are funded and match OWNER_PRIVATE_KEY
- All contract calls are via MetaMask in frontend for signing
- `.env` files avoid hardcoding sensitive info
- SQL rewrite ensures users only query allowed columns/rows

