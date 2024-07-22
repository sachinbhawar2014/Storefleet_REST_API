// Please don't change the pre-written code
// Import the necessary modules here

import {
  createNewOrderRepo,
  getOrderRepo,
  getMyOrdersRepo,
  getAllOrdersPlacedForAdminRepo,
  updateOrderRepo,
} from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import ProductModel from "../../product/model/product.schema.js";
import OrderModel from "../model/order.schema.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  const data = {
    shippingInfo: {
      address: req.body.shippingInfo.address,
      city: req.body.shippingInfo.city,
      state: req.body.shippingInfo.state,
      country: req.body.shippingInfo.country,
      pincode: req.body.shippingInfo.pincode,
      phoneNumber: req.body.shippingInfo.phoneNumber,
    },
    orderedItems: req.body.orderedItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    user: req.user._id,
  };

  if (
    !data.shippingInfo.address ||
    !data.shippingInfo.city ||
    !data.shippingInfo.state ||
    !data.shippingInfo.country ||
    !data.shippingInfo.pincode ||
    !data.shippingInfo.phoneNumber
  ) {
    return next(
      new ErrorHandler(
        406,
        "Incomplete shipping information is not acceptable. Please provide complete shipping information."
      )
    );
  }
  if (data.orderedItems.length == 0) {
    return next(
      new ErrorHandler(400, "There are no items in the orderedtItems. Please select items and then place order.")
    );
  }
  try {
    const orderPlaced = await createNewOrderRepo(data);
    res.status(201).json({ success: true, orderPlaced });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const orderId = req.params.orderId;
    const order = await getOrderRepo(orderId, req.user);
    if (!order) {
      return next(new ErrorHandler(404, "Order not found!"));
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    return next(new ErrorHandler(401, error));
  }
};

export const getMyOrders = async (req, res, next) => {
  // Write your code here for placing a new order
  const userId = req.user._id;
  try {
    const myOrders = await getMyOrdersRepo(userId);
    if (myOrders.length == 0) {
      return next(new ErrorHandler(404, "Orders not found!"));
    }
    res.status(200).json({ success: true, myOrders });
  } catch (error) {
    return next(new ErrorHandler(500, "Something went wrong."));
  }
};

export const getAllOrdersPlacedForAdmin = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const allOrders = await getAllOrdersPlacedForAdminRepo();
    if (allOrders.length == 0) {
      return next(new ErrorHandler(404, "No orders yet!"));
    }
    res.status(200).json({ success: true, allOrders });
  } catch (error) {
    return next(new ErrorHandler(500, "Something went wrong."));
  }
};

export const updateOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const status = req.body.orderStatus;
    const updatedOrder = await updateOrderRepo(req.params.orderId, status);
    if (!updatedOrder) {
      return next(new ErrorHandler(404, "Order not found!"));
    }
    res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
    return next(new ErrorHandler(400, "Something went wrong."));
  }
};

