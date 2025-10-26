// VERY minimal SQL rewriting for SELECT ... FROM ... [WHERE ...]
// Not a full SQL parser — acceptable for PoC with trusted patterns.
// Ensures only allowed columns are selected and injects rowFilter into WHERE.
function rewriteSelect(sql, allowedColumns, rowFilter) {
    // naive: match SELECT <cols> FROM <table> [WHERE <where>]
    const m = sql.match(/select\s+(.+?)\s+from\s+([^\s]+)(\s+where\s+(.+))?/i);
    if (!m) throw new Error("Unsupported SQL. Use: SELECT ... FROM table [WHERE ...]");
  
    const selectPart = m[1].trim();
    const table = m[2].trim();
    const wherePart = m[4] ? m[4].trim() : "";
  
    // columns requested
    const reqCols = selectPart === "*" ? allowedColumns : selectPart.split(",").map(s => s.trim());
  
    // validate requested columns are subset of allowedColumns
    const invalid = reqCols.filter(c => !allowedColumns.includes(c));
    if (invalid.length) throw new Error("Requested unauthorized columns: " + invalid.join(","));
  
    const finalSelect = reqCols.join(", ");
    let finalWhere = "";
    if (wherePart) finalWhere = `(${wherePart})`;
    if (rowFilter) {
      if (finalWhere) finalWhere = `${finalWhere} AND (${rowFilter})`;
      else finalWhere = `${rowFilter}`;
    }
    const rewritten = finalWhere ? `SELECT ${finalSelect} FROM ${table} WHERE ${finalWhere}` : `SELECT ${finalSelect} FROM ${table}`;
    return rewritten;
  }
  
  module.exports = { rewriteSelect };
  