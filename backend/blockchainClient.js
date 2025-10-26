const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const RPC = process.env.RPC_URL;

const artifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "artifacts", "contracts", "AccessControl.sol", "AccessControl.json"))
);

class BlockchainClient {
  constructor(contractAddress) {
    this.provider = new ethers.providers.JsonRpcProvider(RPC);
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, artifact.abi, this.provider);
  }

  connectWithSigner(privateKey) {
    const signer = new ethers.Wallet(privateKey, this.provider);
    return this.contract.connect(signer);
  }

  async getPermissions(userAddress, dataset) {
    const res = await this.contract.getPermissions(userAddress, dataset);
    return {
      allowedColumns: res[0],
      rowFilter: res[1],
      expiry: res[2].toNumber ? Number(res[2]) : parseInt(res[2]),
      canShare: res[3]
    };
  }

  async grantPermission(signerPrivateKey, grantee, dataset, allowedColumns, rowFilter, expirySeconds, canShare) {
    const contractWithSigner = this.connectWithSigner(signerPrivateKey);
    const now = Math.floor(Date.now() / 1000);
    const tx = await contractWithSigner.grantPermission(
      grantee, dataset, allowedColumns, rowFilter, now + expirySeconds, canShare
    );
    return tx.wait();
  }

  async queryEvents(fromBlock = 0, toBlock = "latest") {
    const filterGrant = this.contract.filters.PermissionGranted();
    const events = await this.contract.queryFilter(filterGrant, fromBlock, toBlock);
    return events;
  }
}

module.exports = BlockchainClient;
