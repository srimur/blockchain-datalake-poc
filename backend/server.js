require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { parse: csv } = require("csv-parse/sync");
const BlockchainClient = require("./blockchainClient");
const { client: minioClient, ensureBucket } = require("./minioClient");
const { registerTable, all } = require("./sqliteClient");
const { rewriteSelect } = require("./queryRewriter");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: path.join(__dirname, "uploads/") });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

if (!CONTRACT_ADDRESS) console.warn("Set CONTRACT_ADDRESS in .env to interact with blockchain");
if (!OWNER_PRIVATE_KEY) console.warn("Set OWNER_PRIVATE_KEY in .env for granting permissions");

const bc = new BlockchainClient(CONTRACT_ADDRESS);

// ensure MinIO bucket
(async () => { try { await ensureBucket("datalake"); } catch (e) { console.error(e); } })();

// AUTH endpoints (PoC)
app.post("/auth/nonce", (req, res) => res.json({ nonce: Math.floor(Math.random() * 1e9).toString() }));

app.post("/auth/verify", (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).send("address required");
  res.json({ address, token: "poctoken:" + address });
});

// Data ingest
app.post("/data/ingest", upload.single("file"), async (req, res) => {
  const dataset = req.headers["x-dataset"];
  const uploader = req.headers["x-uploader"];
  if (!dataset || !uploader) return res.status(400).send("dataset and uploader headers required");

  const fileBuffer = fs.readFileSync(req.file.path);
  const objectName = `${dataset}/${Date.now()}_${req.file.originalname}`;
  await minioClient.putObject("datalake", objectName, fileBuffer);

  const records = csv(fileBuffer.toString(), { columns: true, skip_empty_lines: true });
  const columns = Object.keys(records[0] || {});
  await registerTable(dataset, columns, records);

  res.json({ dataset, columns, rows: records.length, objectName });
});

// Query
app.post("/query/execute", async (req, res) => {
  try {
    const { sql, userAddress, dataset } = req.body;
    if (!sql || !userAddress || !dataset) return res.status(400).send("sql, userAddress, dataset required");

    const perms = await bc.getPermissions(userAddress, dataset);
    if (perms.expiry <= Math.floor(Date.now() / 1000)) return res.status(403).send("permission expired or not granted");

    const rewritten = rewriteSelect(sql, perms.allowedColumns, perms.rowFilter);
    const rows = await all(rewritten);
    res.json({ rewritten, rows });
  } catch (err) { console.error(err); res.status(500).send(err.message); }
});

// Share
app.post("/data/share", async (req, res) => {
  try {
    const { grantee, dataset, allowedColumns, rowFilter, expirySeconds, canShare } = req.body;
    if (!OWNER_PRIVATE_KEY) return res.status(500).send("OWNER_PRIVATE_KEY missing in env");
    const receipt = await bc.grantPermission(OWNER_PRIVATE_KEY, grantee, dataset, allowedColumns || [], rowFilter || "", expirySeconds || 3600, !!canShare);
    res.json({ receipt });
  } catch (err) { console.error(err); res.status(500).send(err.message); }
});

// Audit
app.get("/audit/events", async (req, res) => {
  try {
    const events = await bc.queryEvents();
    const mapped = events.map(e => ({
      grantee: e.args[1],
      dataset: e.args[2],
      expiry: e.args[3].toNumber()
    }));
    res.json(mapped);
  } catch (err) { res.status(500).send(err.message); }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Backend listening on", port));
