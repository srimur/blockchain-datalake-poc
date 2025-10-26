const Minio = require("minio");

const client = new Minio.Client({
  endPoint: process.env.MINIO_HOST || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS || "minioadmin",
  secretKey: process.env.MINIO_SECRET || "minioadmin"
});

async function ensureBucket(bucket) {
  const exists = await client.bucketExists(bucket);
  if (!exists) await client.makeBucket(bucket);
}

module.exports = { client, ensureBucket };
