import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SharingAudit() {
  const [events, setEvents] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get(`${backendUrl}/audit/events`);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data || err.message);
      }
    }

    fetchEvents();
  }, [backendUrl]);

  return (
    <div>
      <h2>Sharing Audit</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            Grantee: {e.grantee}, Dataset: {e.dataset}, Expiry: {new Date(e.expiry * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
