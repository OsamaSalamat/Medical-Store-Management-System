
const app = require("./app");
const db = require("./config/db");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@medicalstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";

const createAdminIfMissing = async () => {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  db.query("SELECT * FROM users WHERE email = ?", [ADMIN_EMAIL], (err, results) => {
    if (err) {
      console.error("Admin seed check failed", err);
      return;
    }
    if (results.length === 0) {
      db.query(
        "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        ["Admin", ADMIN_EMAIL, "9999999999", hashed, "admin"],
        (insertErr) => {
          if (insertErr) console.error("Could not create admin user", insertErr);
          else console.log(`Admin seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        }
      );
    } else {
      console.log(`Admin exists: ${ADMIN_EMAIL}`);
    }
  });
};

createAdminIfMissing();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
