const path = require("path");

const swaggerStaticFiles = [
  "swagger-ui.css",
  "swagger-ui.css.map",
  "swagger-ui-bundle.js",
  "swagger-ui-bundle.js.map",
  "swagger-ui-standalone-preset.js",
  "swagger-ui-standalone-preset.js.map",
];

const swaggerRootFiles = ["uiConfig", "initOAuth"];

module.exports = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles"), "**/.*scss"],
  },
  async rewrites() {
    return {
      afterFiles: [
        ...swaggerStaticFiles.map((filename) => ({
          source: `/${filename}`,
          destination: `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/static/${filename}`,
        })),
        ...swaggerRootFiles.map((filename) => ({
          source: `/${filename}`,
          destination: `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/${filename}`,
        })),
        {
          source: "/json",
          destination: `/api/updatedSwaggerJson`,
        },
        {
          source: "/api",
          destination: `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/static/index.html`,
        },
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_DATA_SOURCE_URL}/:path*`,
        },
      ],
    };
  },
};
