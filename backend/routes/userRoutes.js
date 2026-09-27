const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/userController");

router.get("/me", auth, ctrl.getProfile);
router.put("/me", auth, ctrl.updateProfile);
router.put("/change-password", auth, ctrl.changePassword);
router.get("/all", auth, ctrl.listUsers);
router.put("/:id/role", auth, ctrl.updateUserRole);
router.put("/:id", auth, ctrl.adminUpdateUser);
router.delete("/:id", auth, ctrl.deleteUser);

module.exports = router;
