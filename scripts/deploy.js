const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const ac = await AccessControl.deploy();
  await ac.deployed();

  console.log("AccessControl at:", ac.address);

  // Initialize a dataset
  const tx = await ac.setDatasetOwner("employees", deployer.address);
  await tx.wait();

  console.log(`Dataset 'employees' owner set to ${deployer.address}`);
}

main().catch(console.error);
