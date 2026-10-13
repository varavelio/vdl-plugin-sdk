// Generates the landing page and the site support routes (404 and sitemap).
export default function () {
  const pages = [];

  pages.push({
    permalink: "/404.html",
    template: "vara-404",
    title: "Page not found",
    description: "The requested page could not be found.",
    sitemap: false,
    content: "",
  });

  pages.push({
    permalink: "/sitemap.xml",
    template: "vara-sitemap-xml",
  });

  return pages;
}
