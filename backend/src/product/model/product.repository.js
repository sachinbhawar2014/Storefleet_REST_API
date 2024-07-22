import { query } from "express";
import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

export const getAllProductsRepo = async () => {
  return await ProductModel.find({});
};

export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
};

export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

export const getTotalCountsOfProduct = async () => {
  return await ProductModel.countDocuments();
};

export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};

export const filterProductByQueriesRepo = async (query) => {
  let filters = {};

  if (query.category) {
    filters.category = query.category;
  }
  if (query.keyword) {
    filters.name = { $regex: query.keyword, $options: "i" };
  }
  if (query["price"]) {
    filters.price = {};
    if (query.price.lte) {
      filters.price.$lte = Number(query.price.lte);
    }
    if (query.price.gte) {
      filters.price.$gte = Number(query.price.gte);
    }
  }

  if (query["rating"]) {
    filters.rating = {};
    if (query.rating.lte) {
      filters.rating.$lte = Number(query.rating.lte);
    }
    if (query.rating.gte) {
      filters.rating.$gte = Number(query.rating.gte);
    }
  }
  console.log("filters:", filters);
  const products = await ProductModel.find(filters);

  return products;
};
