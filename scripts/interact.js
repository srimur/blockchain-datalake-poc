const hre = require("hardhat");

async function main() {
  const [user] = await hre.ethers.getSigners();
  const userAddress = user.address;

  // Replace with deployed contract address
  const accessControlAddress = "0xEe5e126157d1EF9fbdC24229BfcE91B15DB59d62";

  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.attach(accessControlAddress);

  console.log("Using contract at:", accessControl.address);
const functions = Object.keys(accessControl.interface.functions);
console.log("Contract functions:", functions);

  // Grant access
  const tx = await accessControl.grantPermission(userAddress, "employees");
  await tx.wait();
  console.log(`Granted access to ${userAddress} for dataset "employees"`);

  // Check access
  const hasAccess = await accessControl.checkAccess(userAddress, "employees");
  console.log("User access:", hasAccess); // should print true

  

}

main().catch(console.error);
