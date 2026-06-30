#!/bin/bash
# ============================================================
# Script build untuk deploy ke cPanel shared hosting
# Jalankan di Replit: bash scripts/build-cpanel.sh
# ============================================================

set -e

echo "=== KeeperHub — Build untuk cPanel ==="

# 1. Build Next.js
echo "[1/4] Membangun aplikasi Next.js..."
npm run build

# 2. Buat folder output
echo "[2/4] Menyiapkan folder dist-cpanel/..."
rm -rf dist-cpanel
mkdir -p dist-cpanel

# 3. Salin file yang dibutuhkan
echo "[3/4] Menyalin file..."
cp -r .next dist-cpanel/
cp -r public dist-cpanel/
cp server.js dist-cpanel/
cp package.json dist-cpanel/
cp package-lock.json dist-cpanel/ 2>/dev/null || true
cp .htaccess dist-cpanel/
cp next.config.js dist-cpanel/

# Buat .env.production kosong sebagai template
cat > dist-cpanel/.env.production << 'EOF'
# Isi dengan nilai dari cPanel
DATABASE_URL=postgres://USER:PASS@localhost:5432/DBNAME
NODE_ENV=production
NEXTAUTH_SECRET=GANTI_DENGAN_SECRET_KUAT
NEXTAUTH_URL=https://DOMAIN_ANDA.com
EOF

# 4. Buat ZIP
echo "[4/4] Membuat file ZIP..."
cd dist-cpanel && zip -r ../keeperhub-cpanel.zip . && cd ..

echo ""
echo "✅ Selesai! File siap: keeperhub-cpanel.zip"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Upload keeperhub-cpanel.zip ke cPanel File Manager"
echo "  2. Extract ke folder tujuan (misal: /home/user/keeperhub)"
echo "  3. Buka cPanel → Setup Node.js App"
echo "  4. Ikuti panduan di replit.md bagian Deployment cPanel"
