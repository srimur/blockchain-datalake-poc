import React, { useState } from "react";
import axios from "axios";

export default function Query({ account }) {
  const [dataset, setDataset] = useState("");
  const [sql, setSql] = useState("");
  const [rows, setRows] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleQuery = async () => {
    try {
      const res = await axios.post(`${backendUrl}/query/execute`, { sql, userAddress: account, dataset });
      setRows(res.data.rows);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Query Dataset</h2>
      <input placeholder="Dataset name" value={dataset} onChange={e => setDataset(e.target.value)} />
      <textarea placeholder="SQL SELECT query" value={sql} onChange={e => setSql(e.target.value)} />
      <button onClick={handleQuery}>Execute</button>

      <div>
        <h3>Results</h3>
        <pre>{JSON.stringify(rows, null, 2)}</pre>
      </div>
    </div>
  );
}
