module.exports = {
  reactStrictMode: true,
  // https://github.com/vercel/next.js/issues/22581
  webpack(config) {
    config.module.rules.find(k => k.oneOf !== undefined).oneOf.unshift(
      {
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: 'static/chunks/[path][name].[hash][ext]'
        },
      }
    );
    return config
  }
}
