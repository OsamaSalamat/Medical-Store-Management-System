
const db = require("../config/db");

exports.createOrder = (req, res) => {
  const { items, total, payment_mode, prescription_id, payment_receipt } = req.body;
  const userId = req.user.id;
  if (!items || items.length === 0) return res.status(400).json({ msg: "Cart is empty" });
  if (!payment_mode) return res.status(400).json({ msg: "Payment mode required" });

  // Check prescription required items
  const medicineIds = items.map((i) => i.id);
  db.query("SELECT id,prescription_required,stock FROM medicines WHERE id IN (?)", [medicineIds], (err, meds) => {
    if (err) return res.status(500).json(err);
    const medicineMap = {};
    meds.forEach((m) => (medicineMap[m.id] = m));
    for (const item of items) {
      const med = medicineMap[item.id];
      if (!med) return res.status(400).json({ msg: `Medicine ${item.id} not found` });
      if (med.prescription_required && !req.body.prescription_id) {
        return res.status(400).json({ msg: "Prescription required for some medicines" });
      }
      if (item.quantity > med.stock) {
        return res.status(400).json({ msg: `Insufficient stock for ${item.id}` });
      }
    }

    const orderId = "ORD" + Date.now();
    const receipt = payment_receipt || null;
    db.query(
      "INSERT INTO orders (user_id,order_id,total,status,payment_mode,payment_receipt,priority, prescription_id) VALUES (?,?,?,?,?,?,?,?)",
      [userId, orderId, total, "Pending", payment_mode, receipt, "normal", prescription_id || null],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        const orderDBid = result.insertId;
        const insertPromises = items.map((item) => {
          return new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO order_items (order_id,medicine_id,quantity,price) VALUES (?,?,?,?)",
              [orderDBid, item.id, item.quantity, item.price],
              (err3) => {
                if (err3) reject(err3);
                else resolve();
              }
            );
          });
        });
        Promise.all(insertPromises)
          .then(() => {
            // Decrease stock
            const stockQueries = items.map((item) => {
              return new Promise((resolve, reject) => {
                db.query("UPDATE medicines SET stock = stock - ? WHERE id = ?", [item.quantity, item.id], (err4) => {
                  if (err4) reject(err4);
                  else resolve();
                });
              });
            });
            Promise.all(stockQueries)
              .then(() => res.json({ msg: "Order placed", orderId }))
              .catch((err5) => res.status(500).json(err5));
          })
          .catch((err3b) => res.status(500).json(err3b));
      }
    );
  });
};

exports.getOrderHistory = (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

exports.getOrderDetails = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM orders WHERE id = ?", [id], (err, orders) => {
    if (err) return res.status(500).json(err);
    if (orders.length === 0) return res.status(404).json({ msg: "Order not found" });
    db.query("SELECT * FROM order_items WHERE order_id = ?", [orders[0].id], (err2, items) => {
      if (err2) return res.status(500).json(err2);
      res.json({ order: orders[0], items });
    });
  });
};

exports.getAllOrders = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updateOrderStatus = (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });
  const id = req.params.id;
  const { status } = req.body;
  const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ msg: "Invalid status" });
  db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "Order not found" });
    res.json({ msg: "Order status updated" });
  });
};

exports.getInventoryReport = (req, res) => {
  db.query("SELECT category, COUNT(*) AS total_medicines, SUM(stock) AS total_stock FROM medicines GROUP BY category", (err,result)=>{
    if(err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getSalesReport = (req, res) => {
  db.query("SELECT DATE(created_at) AS day, SUM(total) AS revenue, COUNT(*) AS orders FROM orders GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 30", (err,result)=>{
    if(err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getLowStock = (req, res) => {
  const threshold = Number(req.query.threshold || 10);
  db.query("SELECT * FROM medicines WHERE stock <= ? ORDER BY stock ASC", [threshold], (err,result)=>{
    if(err) return res.status(500).json(err);
    res.json(result);
  });
};
