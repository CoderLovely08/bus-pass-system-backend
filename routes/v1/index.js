import express from "express";
import authRoutes from "./auth.routes.js";
import passengerRoutes from "./passenger.routes.js";
import adminRoutes from "./admin.routes.js";
import conductorRoutes from "./conductor.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/passenger", passengerRoutes);
router.use("/admin", adminRoutes);
router.use("/conductor", conductorRoutes);

export default router;
