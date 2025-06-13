import dbConnect from '../lib/mongodb';
import Article from '../lib/models/Article';
import Live from '../lib/models/Live';

async function seed() {
  await dbConnect();

  // Add sample articles
  const sampleArticles = [
    {
      name: "Elegant Evening Dress",
      description: "Beautiful evening dress perfect for special occasions",
      price: 8500,
      images: ["https://example.com/dress1.jpg"],
      category: "formal",
      size: ["S", "M", "L", "XL"],
      color: ["Black", "Navy", "Burgundy"],
      inStock: true,
      featured: true
    },
    // Add more sample data...
  ];

  await Article.insertMany(sampleArticles);
  console.log('Database seeded successfully!');
}

seed().catch(console.error);