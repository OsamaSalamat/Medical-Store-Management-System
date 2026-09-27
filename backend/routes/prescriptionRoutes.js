
const router = require("express").Router();
const ctrl = require("../controllers/prescriptionController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", auth, upload.single("file"), ctrl.uploadPrescription);
router.get("/", auth, ctrl.getPrescriptions);
router.put("/:id/status", auth, ctrl.updatePrescriptionStatus);

module.exports = router;
