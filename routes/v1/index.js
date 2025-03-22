import express from "express";
import authRoutes from "./auth.routes.js";
import passengerRoutes from "./passenger.routes.js";
import adminRoutes from "./admin.routes.js";
import conductorRoutes from "./conductor.routes.js";
import { checkRole, validateToken } from "../../middlewares/auth.middleware.js";
import { USER_TYPES } from "../../utils/constants/app.constant.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use(
  "/passenger",
  validateToken,
  checkRole([USER_TYPES.PASSENGER]),
  passengerRoutes
);
router.use("/admin", validateToken, checkRole([USER_TYPES.ADMIN]), adminRoutes);
router.use(
  "/conductor",
  validateToken,
  checkRole([USER_TYPES.CONDUCTOR]),
  conductorRoutes
);

export default router;
