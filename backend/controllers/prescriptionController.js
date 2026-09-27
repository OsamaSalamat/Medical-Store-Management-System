
const db = require("../config/db");

exports.uploadPrescription = (req, res) => {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ msg: "File required" });
  const file = req.file.path;
  db.query(
    "INSERT INTO prescriptions (user_id, file_path, status) VALUES (?, ?, 'pending')",
    [userId, file],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Prescription uploaded", id: result.insertId });
    }
  );
};

exports.getPrescriptions = (req,res)=>{
  const userId = req.user.id;
  if (req.user.role === 'admin') {
    return db.query("SELECT p.*, u.name AS user_name, u.email AS user_email FROM prescriptions p JOIN users u ON p.user_id = u.id ORDER BY p.id DESC", (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json(result);
    });
  }
  db.query("SELECT * FROM prescriptions WHERE user_id = ? ORDER BY id DESC", [userId], (err,result)=>{
    if(err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updatePrescriptionStatus = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  const { status } = req.body;
  db.query("UPDATE prescriptions SET status = ? WHERE id = ?", [status, id], (err,result)=>{
    if(err) return res.status(500).json(err);
    if(result.affectedRows === 0) return res.status(404).json({ msg: "Prescription not found" });
    res.json({ msg: "Prescription status updated" });
  });
};
