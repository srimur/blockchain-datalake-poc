import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import AccessControl from "./contracts/AccessControl.json";
import DataOwner from "./pages/DataOwner";
import Query from "./pages/Query";
import SharingAudit from "./pages/SharingAudit";

export default function App() {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function initBlockchain() {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const account = accounts[0];

      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.error("Contract address not set in .env");
        return;
      }

      const contractInstance = new ethers.Contract(contractAddress, AccessControl.abi, signer);

      setContract(contractInstance);
      setSigner(signer);
      setAccount(account);

      window.contract = contractInstance;
      window.signer = signer;
    }

    initBlockchain();
  }, []);

  if (!contract) return <div>Loading blockchain...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Blockchain DataLake Frontend</h1>
      <p>Connected account: {account}</p>

      <DataOwner contract={contract} signer={signer} account={account} />
      <hr />
      <Query contract={contract} account={account} />
      <hr />
      <SharingAudit contract={contract} />
    </div>
  );
}
