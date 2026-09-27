
const db = require("../config/db");

exports.getMedicines = (req, res) => {
  const { q, category, minPrice, maxPrice, prescription_required, sortBy } = req.query;
  let sql = "SELECT * FROM medicines";
  const where = [];
  const params = [];

  if (q) {
    where.push("(name LIKE ? OR brand LIKE ? OR category LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category && category !== "All categories") {
    where.push("category = ?");
    params.push(category);
  }
  if (prescription_required !== undefined) {
    const reqVal = prescription_required === "true" || prescription_required === "1" || prescription_required === 1;
    where.push("prescription_required = ?");
    params.push(reqVal ? 1 : 0);
  }
  const min = Number(minPrice);
  if (!Number.isNaN(min)) {
    where.push("price >= ?");
    params.push(min);
  }
  const max = Number(maxPrice);
  if (!Number.isNaN(max)) {
    where.push("price <= ?");
    params.push(max);
  }
  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }
  if (sortBy === "price_asc") sql += " ORDER BY price ASC";
  else if (sortBy === "price_desc") sql += " ORDER BY price DESC";
  else sql += " ORDER BY id DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("getMedicines SQL error", err, { sql, params });
      return res.status(500).json({ msg: "Could not fetch medicines" });
    }
    res.json(result);
  });
};

exports.getMedicineById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM medicines WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ msg: "Medicine not found" });
    const med = result[0];
    med.dosage = "Take one tablet twice daily after meals.";
    med.side_effects = "Nausea, headache, dizziness.";
    med.interactions = "Do not combine with blood thinners.";
    res.json(med);
  });
};

exports.addMedicine = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const { name, brand, category, price, stock, expiry_date, prescription_required } = req.body;
  db.query(
    "INSERT INTO medicines (name,brand,category,price,stock,expiry_date,prescription_required) VALUES (?,?,?,?,?,?,?)",
    [name, brand, category, price, stock, expiry_date, prescription_required ? 1 : 0],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Medicine added", id: result.insertId });
    }
  );
};

exports.updateMedicine = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  const { name, brand, category, price, stock, expiry_date, prescription_required } = req.body;
  db.query(
    "UPDATE medicines SET name=?,brand=?,category=?,price=?,stock=?,expiry_date=?,prescription_required=? WHERE id=?",
    [name, brand, category, price, stock, expiry_date, prescription_required ? 1 : 0, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ msg: "Medicine not found" });
      res.json({ msg: "Medicine updated" });
    }
  );
};

exports.deleteMedicine = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  db.query("DELETE FROM medicines WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "Medicine not found" });
    res.json({ msg: "Medicine deleted" });
  });
};

exports.lowStock = (req, res) => {
  const threshold = Number(req.query.threshold || 5);
  db.query("SELECT * FROM medicines WHERE stock <= ? ORDER BY stock ASC", [threshold], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
