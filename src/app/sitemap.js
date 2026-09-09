import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function sitemap() {
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://radha-outfit-collection.vercel.app";

  let productEntries = [];

  try {
    await connectToDatabase();
    const products = await Product.find({ inStock: true })
      .select("slug updatedAt")
      .lean();

    productEntries = products.map((item) => ({
      url: `${baseUrl}/product/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  const staticEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticEntries, ...productEntries];
}