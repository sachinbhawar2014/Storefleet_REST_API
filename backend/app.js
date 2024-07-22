import express from "express";
import dotenv from "dotenv";
import path from "path";
import productRoutes from "./src/product/routes/product.routes.js";
import { errorHandlerMiddleware, handleUncaughtError } from "./middlewares/errorHandlerMiddleware.js";
import userRoutes from "./src/user/routes/user.routes.js";
import cookieParser from "cookie-parser";
import swagger from "swagger-ui-express";
import orderRoutes from "./src/order/routes/order.routes.js";
import apiDocs from "./swagger.json" assert { type: "json" };

const configPath = path.resolve("config", "uat.env");
dotenv.config({ path: configPath });

const app = express();
app.use(express.json());
app.use(cookieParser());

// configure routes
app.use("/api/storefleet/product", productRoutes);
app.use("/api/storefleet/user", userRoutes);
app.use("/api/storefleet/order", orderRoutes);

//documentation route
app.use("/api-docs", swagger.serve, swagger.setup(apiDocs));

// errorHandlerMiddleware
app.use(errorHandlerMiddleware);

//other unsupported routes
app.all("*", (req, res) => {
  res.status(404).send({
    success: false,
    msg: "This route is not Supported by this app. For referece please check documentation at /api-docs",
  });
});

export default app;
