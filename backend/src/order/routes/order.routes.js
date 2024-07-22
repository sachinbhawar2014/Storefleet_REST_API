import express, { Router } from "express";
import {
  createNewOrder,
  getOrder,
  getMyOrders,
  getAllOrdersPlacedForAdmin,
  updateOrder,
} from "../controllers/order.controller.js";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

const router = express.Router();

//post routes
router.route("/new").post(auth, createNewOrder);

// get routes
router.route("/:orderId").get(auth, getOrder);
router.route("/my/orders").get(auth, getMyOrders);

//admin routes
router.route("/orders/placed").get(auth, authByUserRole("admin"), getAllOrdersPlacedForAdmin);

// put routes
router.route("/update/:orderId").put(auth, authByUserRole("admin"), updateOrder);

export default router;
