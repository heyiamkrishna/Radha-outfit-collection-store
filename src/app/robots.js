export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://radha-outfit-collection.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/about", "/product/"],
        disallow: ["/admin/", "/account/", "/api/", "/checkout/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}