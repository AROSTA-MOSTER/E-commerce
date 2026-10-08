import { Request, Response } from "express";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { Product } from "../models/product.model";

const uploadToCloudinary = (buffer: Buffer): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload returned no result"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, sort } = req.query;
    const filter: Record<string, any> = {};

    const searchTerm = (typeof search === "string" ? search : (typeof req.query.q === "string" ? req.query.q : "")).trim();
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    let query = Product.find(filter);

    if (sort === "price-asc" || sort === "asc" || sort === "low-high") {
      query = query.sort({ price: 1 });
    } else if (sort === "price-desc" || sort === "desc" || sort === "high-low") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();
    res.status(200).json(products);
  } catch {
    res.status(500).json({ message: "Failed to retrieve products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch {
    res.status(500).json({ message: "Failed to retrieve product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const category = req.body.category || "General";

    if (!name || !description || !price) {
      return res.status(400).json({ message: "name, description and price are required" });
    }

    let imageUrl = req.body.imageUrl;

    if (req.file) {
      try {
        const uploaded = await uploadToCloudinary(req.file.buffer);
        imageUrl = uploaded.secure_url;
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed, falling back to placeholder:", uploadErr);
        imageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/sample.jpg`;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      imageUrl,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated", product });
  } catch {
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted", product });
  } catch {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
