
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password) return res.status(400).json({ msg: "Missing fields" });
  if (!validateEmail(email)) return res.status(400).json({ msg: "Invalid email" });
  if (password.length < 6) return res.status(400).json({ msg: "Password must be at least 6 characters" });
  const allowedRoles = ["patient", "doctor", "pharmacist", "admin"];
  const userRole = role && allowedRoles.includes(role) ? role : "patient";

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, existing) => {
    if (err) return res.status(500).json(err);
    if (existing.length > 0) return res.status(400).json({ msg: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hash, userRole],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json({ msg: "User registered", userId: result.insertId });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: "Missing credentials" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(400).json({ msg: "User not found" });
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ msg: "Missing fields" });
  if (!validateEmail(email)) return res.status(400).json({ msg: "Invalid email" });
  if (newPassword.length < 6) return res.status(400).json({ msg: "Password too short" });

  const hash = await bcrypt.hash(newPassword, 10);
  db.query("UPDATE users SET password = ? WHERE email = ?", [hash, email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Password reset successful" });
  });
};
