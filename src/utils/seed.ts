import dotenv from "dotenv";
import { connectDB } from "../config/database";
import { Product } from "../models/product.model";

dotenv.config();

const initialProducts = [
  {
    name: "Golden Roast Arabica Coffee Beans 500g",
    description: "Locally grown Rwandan single origin Arabica coffee beans, fresh medium roast.",
    category: "General",
    price: 9500,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Fresh Rwandan Organic Strawberries 500g",
    description: "Sweet, handpicked fresh red strawberries from Rulindo volcanic highlands.",
    category: "General",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Inyange Full Cream Fresh Milk 1L",
    description: "Nutritious pasteurized wholesome Rwandan fresh cow milk.",
    category: "General",
    price: 1200,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Pure Sunflower Cooking Oil 5L",
    description: "Refined triple-filtered cholesterol-free sunflower cooking oil.",
    category: "General",
    price: 16500,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Premium Mango Passion Juice 1L",
    description: "Refreshing natural tropical mango and passion fruit blend.",
    category: "General",
    price: 2200,
    imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Ultra Slim High Performance Laptop 15.6-inch",
    description: "Fast multi-core processor, 16GB RAM, 512GB SSD with FHD anti-glare screen.",
    category: "General",
    price: 685000,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Artisan Sourdough Bakery Bread 800g",
    description: "Naturally leavened crispy crust artisanal sourdough loaf baked daily.",
    category: "General",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Natural Forest Honey Jar 500g",
    description: "100% pure raw unpasteurized multi-floral natural Rwandan honey.",
    category: "General",
    price: 4800,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60",
  },
];

async function seed() {
  try {
    await connectDB();
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log(`Seeded ${initialProducts.length} sample products into Atlas database!`);
    } else {
      console.log(`Database already has ${count} products.`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
