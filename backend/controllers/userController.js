const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id,name,email,phone,role,created_at FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ msg: "User not found" });
    res.json(result[0]);
  });
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, password } = req.body;
  if (password && password.length < 6) return res.status(400).json({ msg: "Password too short" });
  const updates = [name, email, phone];
  let query = "UPDATE users SET name = ?, email = ?, phone = ?";
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    query += ", password = ?";
    updates.push(hashed);
  }
  query += " WHERE id = ?";
  updates.push(userId);
  db.query(query, updates, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Profile updated" });
  });
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ msg: "Missing passwords" });
  if (newPassword.length < 6) return res.status(400).json({ msg: "Password too short" });

  db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ msg: "User not found" });
    const match = await bcrypt.compare(oldPassword, result[0].password);
    if (!match) return res.status(400).json({ msg: "Wrong old password" });
    const hash = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ msg: "Password changed" });
    });
  });
};

exports.listUsers = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  db.query("SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updateUserRole = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  const { role } = req.body;
  const allowed = ["patient", "doctor", "pharmacist", "admin"];
  if (!allowed.includes(role)) return res.status(400).json({ msg: "Invalid role" });
  db.query("UPDATE users SET role = ? WHERE id = ?", [role, id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Role updated" });
  });
};

exports.adminUpdateUser = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  const { name, email, phone, role } = req.body;
  const allowed = ["patient", "doctor", "pharmacist", "admin"];
  if (role && !allowed.includes(role)) return res.status(400).json({ msg: "Invalid role" });

  db.query("SELECT id FROM users WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json({ msg: "User not found" });
    const updates = [];
    const params = [];
    if (name) { updates.push("name = ?"); params.push(name); }
    if (email) { updates.push("email = ?"); params.push(email); }
    if (phone) { updates.push("phone = ?"); params.push(phone); }
    if (role) { updates.push("role = ?"); params.push(role); }
    if (updates.length === 0) return res.status(400).json({ msg: "No fields to update" });
    params.push(id);
    db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params, (err2, result) => {
      if (err2) return res.status(500).json(err2);
      res.json({ msg: "User updated" });
    });
  });
};

exports.deleteUser = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User deleted" });
  });
};