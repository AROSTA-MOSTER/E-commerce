/**
 * Fallback & Initial Seed Data for N.Honest Supermarket Frontend Clone
 * Extracted directly from live backend endpoints.
 */

window.MOCK_CATEGORIES = [
  {
    "_id": "69522785bf0d8b44cb5157fd",
    "name": "N.HONEST COFFEE SHOP",
    "slug": "n-honest-coffee-shop",
    "description": "TEA, COFFEE, MILKSHAKE, FRESH JUICE AND SMOOTHIES",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779025109/n-honest/categories/bei8wewfuqelbw0ujedj.png",
    "products": 31
  },
  {
    "_id": "68226e67016d35c15bb37539",
    "name": "BEER, WINE AND LIQUOR",
    "slug": "beer-wine-and-liquor",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1778178913/n-honest/categories/hs8jyygybdlhabfuswt5.webp",
    "products": 194
  },
  {
    "_id": "68226c65016d35c15bb37520",
    "name": "FRUITS, VEGETABLES, FISH AND MEAT",
    "slug": "fruits-vegetables-fish-and-meat",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1778176591/n-honest/categories/uciqbjkx2kexpiqw6mtm.jpg",
    "products": 432
  },
  {
    "_id": "68226bb6016d35c15bb37512",
    "name": "TEA, COFFEE, HONEY AND COCOA",
    "slug": "tea-coffee-honey-and-cocoa",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779025540/n-honest/categories/s9ml0xir5mkww3ekpvub.png",
    "products": 180
  },
  {
    "_id": "68226b55016d35c15bb374fc",
    "name": "COOKING OIL, TINS AND CANS",
    "slug": "cooking-oil-tins-and-cans",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779026316/n-honest/categories/ghpp2zdeoawi74757sol.png",
    "products": 240
  },
  {
    "_id": "68226b3f016d35c15bb374f1",
    "name": "WATER, JUICES AND SOFT DRINKS",
    "slug": "water-juices-and-soft-drinks",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779026422/n-honest/categories/al8zshktynzgnwvjoljj.png",
    "products": 174
  },
  {
    "_id": "68226acb016d35c15bb374d9",
    "name": "MILK, DAIRY AND EGG",
    "slug": "milk-dairy-and-egg",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779026641/n-honest/categories/wfnx02onanmua3utupbf.png",
    "products": 277
  },
  {
    "_id": "68226864016d35c15bb374a1",
    "name": "BISCUITS, CRISPS AND CHEWING GUM",
    "slug": "biscuits-crisps-and-chewing-gum",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779028366/n-honest/categories/uwfab5wfkenffzy9ects.jpg",
    "products": 615
  },
  {
    "_id": "6822649b016d35c15bb37417",
    "name": "LAUNDRY, TOILET AND HOUSEHOLD",
    "slug": "laundry-toilet-and-household",
    "image": "https://res.cloudinary.com/dm1czb59h/image/upload/v1779039873/n-honest/categories/wglqaik4uiqaadhhvh8g.png",
    "products": 783
  }
];

window.MOCK_PAGE_1_PRODUCTS = [
  {
    "_id": "prod_101",
    "name": "Golden Roast Coffee Beans 500g",
    "category": { "_id": "69522785bf0d8b44cb5157fd", "name": "N.HONEST COFFEE SHOP" },
    "price": 9500,
    "originalPrice": 12000,
    "description": "Locally grown Rwandan single origin Arabica coffee beans, fresh medium roast.",
    "featuredImage": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60",
    "stock": 35,
    "sizes": [
      { "name": "500g", "price": 9500 },
      { "name": "1kg", "price": 18000 }
    ]
  },
  {
    "_id": "prod_102",
    "name": "Fresh Organic Rwandan Strawberries 250g",
    "category": { "_id": "68226c65016d35c15bb37520", "name": "FRUITS, VEGETABLES, FISH AND MEAT" },
    "price": 3500,
    "description": "Sweet, handpicked fresh red strawberries from Rulindo volcanic highlands.",
    "featuredImage": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60",
    "stock": 18
  },
  {
    "_id": "prod_103",
    "name": "Inyange Full Cream Fresh Milk 1L",
    "category": { "_id": "68226acb016d35c15bb374d9", "name": "MILK, DAIRY AND EGG" },
    "price": 1200,
    "description": "Nutritious pasteurized wholesome Rwandan cow milk.",
    "featuredImage": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    "stock": 100
  },
  {
    "_id": "prod_104",
    "name": "Pure Sunflower Cooking Oil 5L",
    "category": { "_id": "68226b55016d35c15bb374fc", "name": "COOKING OIL, TINS AND CANS" },
    "price": 16500,
    "originalPrice": 18500,
    "description": "Refined triple-filtered cholesterol-free sunflower cooking oil.",
    "featuredImage": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
    "stock": 42
  },
  {
    "_id": "prod_105",
    "name": "Pran Frooto Premium Mango Juice 500ml",
    "category": { "_id": "68226b3f016d35c15bb374f1", "name": "WATER, JUICES AND SOFT DRINKS" },
    "price": 1200,
    "description": "Refreshing natural mango pulpy nectar drink.",
    "featuredImage": "https://res.cloudinary.com/dm1czb59h/image/upload/v1787213085/n-honest/products/ehuvwokllwm4gyvgqcj1.png",
    "stock": 60,
    "sizes": [
      { "name": "250ml", "price": 800 },
      { "name": "500ml", "price": 1200 }
    ]
  },
  {
    "_id": "prod_106",
    "name": "Louis Eschenauer Syrah Red Wine 75cl",
    "category": { "_id": "68226e67016d35c15bb37539", "name": "BEER, WINE AND LIQUOR" },
    "price": 25000,
    "originalPrice": 28000,
    "description": "Rich structured French Syrah red wine with ripe black fruit notes.",
    "featuredImage": "https://res.cloudinary.com/dm1czb59h/image/upload/v1787295404/n-honest/products/gjuysoa3uimptoevoqmp.png",
    "stock": 24
  }
];
