
const router = require("express").Router();
const ctrl = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");

router.post("/create", auth, ctrl.createOrder);
router.get("/history", auth, ctrl.getOrderHistory);
router.get("/:id", auth, ctrl.getOrderDetails);
router.get("/admin/all", auth, ctrl.getAllOrders);
router.put("/admin/:id/status", auth, ctrl.updateOrderStatus);
router.get("/reports/inventory", auth, ctrl.getInventoryReport);
router.get("/reports/sales", auth, ctrl.getSalesReport);
router.get("/low-stock", auth, ctrl.getLowStock);

module.exports = router;
