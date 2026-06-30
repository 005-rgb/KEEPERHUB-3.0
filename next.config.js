/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Matikan X-Powered-By header di production
  poweredByHeader: false,
  // Output standalone: bundel semua dependency untuk upload ke server
  // Aktifkan ini jika ingin upload minimal (tanpa node_modules penuh)
  // output: 'standalone',
}

module.exports = nextConfig
