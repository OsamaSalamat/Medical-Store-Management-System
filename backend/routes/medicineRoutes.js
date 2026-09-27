
const router = require("express").Router();
const ctrl = require("../controllers/medicineController");
const auth = require("../middleware/authMiddleware");

router.get("/", ctrl.getMedicines);
router.get("/search", ctrl.getMedicines);
router.get("/:id", ctrl.getMedicineById);
router.post("/add", auth, ctrl.addMedicine);
router.put("/:id", auth, ctrl.updateMedicine);
router.delete("/:id", auth, ctrl.deleteMedicine);
router.get("/alerts/low-stock", auth, ctrl.lowStock);

module.exports = router;
