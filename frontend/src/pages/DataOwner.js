import React, { useState } from "react";
import axios from "axios";

export default function DataOwner({ contract, signer, account }) {
  const [grantee, setGrantee] = useState("");
  const [dataset, setDataset] = useState("");
  const [allowedColumns, setAllowedColumns] = useState("");
  const [rowFilter, setRowFilter] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const [canShare, setCanShare] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleShare = async () => {
    try {
      const res = await axios.post(`${backendUrl}/data/share`, {
        grantee,
        dataset,
        allowedColumns: allowedColumns.split(",").map(c => c.trim()),
        rowFilter,
        expirySeconds,
        canShare
      });
      alert("Permission granted. Tx receipt: " + res.data.receipt.transactionHash);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Data Owner Panel</h2>
      <input placeholder="Grantee address" value={grantee} onChange={e => setGrantee(e.target.value)} />
      <input placeholder="Dataset name" value={dataset} onChange={e => setDataset(e.target.value)} />
      <input placeholder="Allowed columns (comma separated)" value={allowedColumns} onChange={e => setAllowedColumns(e.target.value)} />
      <input placeholder="Row filter (SQL)" value={rowFilter} onChange={e => setRowFilter(e.target.value)} />
      <input type="number" placeholder="Expiry seconds" value={expirySeconds} onChange={e => setExpirySeconds(Number(e.target.value))} />
      <label>
        <input type="checkbox" checked={canShare} onChange={e => setCanShare(e.target.checked)} />
        Can share further
      </label>
      <button onClick={handleShare}>Grant Permission</button>
    </div>
  );
}
