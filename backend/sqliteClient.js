const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_FILE = path.join(__dirname, "data.db");
if (!fs.existsSync(DB_FILE)) {
  fs.closeSync(fs.openSync(DB_FILE, "w"));
}
const db = new sqlite3.Database(DB_FILE);

function run(sql, params = []) {
  return new Promise((res, rej) => db.run(sql, params, function (err) {
    if (err) return rej(err);
    res(this);
  }));
}

function all(sql, params = []) {
  return new Promise((res, rej) => db.all(sql, params, (err, rows) => {
    if (err) return rej(err);
    res(rows);
  }));
}

// create table from CSV: columns provided as array
async function registerTable(tableName, columns, rows) {
  // create table
  const colDefs = columns.map(c => `"${c}" TEXT`).join(",");
  await run(`DROP TABLE IF EXISTS "${tableName}"`);
  await run(`CREATE TABLE "${tableName}" (${colDefs})`);
  const placeholders = columns.map(() => "?").join(",");
  const stmt = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(",")}) VALUES (${placeholders})`;
  for (const r of rows) {
    const vals = columns.map(c => (r[c] !== undefined ? r[c] : null));
    await run(stmt, vals);
  }
}

module.exports = { run, all, registerTable };
