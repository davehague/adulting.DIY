// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-09-20",
  devtools: { enabled: true },
  devServer: {
    https: {
      key: "./localhost-key.pem",
      cert: "./localhost.pem",
    },
  },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "nuxt-vue3-google-signin"],
  googleSignIn: {
    clientId:
      "438128158573-pbbsttfbp8e7o81nmtavl5stbv49vmap.apps.googleusercontent.com",
  },
  app: {
    head: {
      title: "Adulting.DIY",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "msapplication-TileColor", content: "#2b5797" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
      ],
    },
  },
} as any);
