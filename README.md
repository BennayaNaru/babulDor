# PKK Marketplace – Kantin Digital PKK Sekolah

Aplikasi web untuk mengelola kantin/marketplace PKK sekolah. Siswa dan guru bisa melihat katalog, memesan, dan menitipkan dagangan. Pengurus PKK memverifikasi dagangan, mengelola pesanan dan stok, serta merekap penjualan. Pembina memantau rekap penjualan dalam mode baca saja. Data yang ada di aplikasi ini adalah **data demo untuk pengembangan**.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS
- **Backend:** Laravel 13 (PHP 8.3+), REST API dengan Laravel Sanctum
- **Database:** MySQL

## Prasyarat

- [PHP 8.4](https://www.php.net/downloads) atau lebih baru (ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` aktif)
- [MySQL](https://dev.mysql.com/downloads/) 8.0 atau lebih baru (atau MariaDB 10.6+, sudah termasuk di XAMPP/Laragon)
- [Composer](https://getcomposer.org/) 2.x
- [Node.js](https://nodejs.org/) 20.19 atau lebih baru (disarankan LTS terbaru)
- Git

## Cara Menjalankan

1. Clone repository:

   ```bash
   git clone https://github.com/BennayaNaru/babulDor.git
   cd babulDor
   ```

2. Buat database MySQL yang masih kosong, misalnya bernama `pkk_marketplace`:

   ```sql
   CREATE DATABASE pkk_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   Bisa lewat phpMyAdmin, MySQL Workbench, atau terminal (`mysql -u root -p`).

3. Jalankan **backend** (terminal pertama):

   ```bash
   cd babulDor
   composer install
   cp .env.example .env              # Windows (CMD): copy .env.example .env
   php artisan key:generate
   ```

   Buka file `.env`, ganti bagian database dengan pengaturan MySQL:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=pkk_marketplace
   DB_USERNAME=root
   DB_PASSWORD=
   ```

   Lalu lanjutkan:

   ```bash
   php artisan migrate --seed
   php artisan storage:link
   php artisan serve
   ```

   Backend aktif di http://localhost:8000 (cek di http://localhost:8000/up).

4. Jalankan **frontend** (terminal kedua, backend tetap menyala):

   ```bash
   cd pkk-frontend
   npm install
   npm run dev
   ```

   Buka http://localhost:5173

   Saat development, Vite otomatis meneruskan `/api` dan `/storage` ke `http://localhost:8000`, jadi tidak perlu membuat file `.env` untuk frontend.

## Akun Demo

Login tidak memakai password, cukup isi **NISN/NIP**, **Nama**, dan **Kelas/Jabatan**. Di halaman login ada kotak "Akun Coba Cepat (Demo)" untuk mengisi form otomatis.

| Akun | NISN/NIP | Nama | Kelas/Jabatan | Peran |
|---|---|---|---|---|
| Siswa Demo | `0000000001` | `Siswa Demo` | `XI RPL` | Siswa: belanja dan menitipkan dagangan |
| Pengurus Demo | `0000000003` | `Pengurus Demo` | `XI AK 1` | Admin pengurus |
| Admin Pembina | `0000000002` | `Admin Pembina` | `Pembina PKK` | Admin pembina (hanya baca) |

## Perintah Berguna

| Perintah | Lokasi | Fungsi |
|---|---|---|
| `php artisan migrate:fresh --seed` | `babulDor/` | Menghapus semua data, membuat ulang tabel, mengisi data awal |
| `php artisan test` | `babulDor/` | Menjalankan test backend |
| `php artisan route:list` | `babulDor/` | Melihat daftar endpoint API |
| `npm run build` | `pkk-frontend/` | Build production ke folder `dist/` |
| `npm run lint` | `pkk-frontend/` | Memeriksa kode dengan ESLint |

> `php artisan db:seed` hanya aman dijalankan **sekali** pada database kosong. Untuk mengulang dari awal, pakai `php artisan migrate:fresh --seed`.

## Masalah Umum

| Gejala | Solusi |
|---|---|
| "Tidak dapat terhubung ke server" | Backend belum jalan. Jalankan `php artisan serve` di folder `babulDor`. |
| "Data tidak cocok dengan akun terdaftar" | Seeder belum dijalankan, atau data login tidak sesuai tabel akun demo. |
| `could not find driver` | Aktifkan ekstensi `pdo_mysql` di `php.ini`, lalu restart terminal. |
| `Access denied for user` | `DB_USERNAME` atau `DB_PASSWORD` di `.env` salah. |
| `Unknown database` | Database belum dibuat. Jalankan perintah `CREATE DATABASE` di langkah 2. |
| `Connection refused` | MySQL belum menyala. Start MySQL di XAMPP/Laragon, atau cek `DB_HOST` dan `DB_PORT`. |
| Gambar produk tidak muncul | Jalankan `php artisan storage:link` dan pastikan `APP_URL=http://localhost:8000` di `.env`. |

## Deploy (Frontend dan Backend Terpisah)

- **Frontend (Vercel/Netlify):** isi `VITE_API_URL` dengan domain backend, lalu redeploy. Gunakan `VITE_SHOW_DEMO=true` hanya jika kotak akun demo memang ingin ditampilkan.
- **Backend:** isi `allowed_origins` di `config/cors.php` dengan domain frontend yang persis (tanpa `/` di akhir), set `APP_URL`, `APP_KEY`, `APP_DEBUG=false`, lalu jalankan `php artisan migrate --force`, `php artisan storage:link`, dan seeder.
- Isi `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di environment variables backend dengan data database MySQL dari penyedia hosting (misalnya MySQL dari Railway). Jangan memakai `127.0.0.1` kecuali MySQL berada di server yang sama.
- Karena login tanpa password, akun demo yang tampil di production bisa dipakai siapa saja. Aktifkan hanya untuk demo atau penilaian.

## Progress Saat Ini

- [x] Halaman Masuk (login NISN/NIP, nama, kelas/jabatan)
- [x] Katalog produk (filter, detail produk, keranjang)
- [x] Pesanan siswa/guru (buat dan batalkan pesanan, titik ambil)
- [x] Ajukan dagangan dan Dagangan Saya
- [x] Dashboard admin pengurus
- [x] Verifikasi pengajuan dagangan
- [x] Kelola produk dan pesanan (admin pengurus)
- [x] Rekap penjualan dan ekspor (pengurus dan pembina, pembina hanya baca)
- [x] Halaman Arsip Pengguna (admin pengurus)
- [x] Halaman Ringkasan Pembina
- [x] Halaman Produk & Artikel (pembina)

## Tim

| No | Nama |
|---|---|
| 1 | Bennaya Muhammad Caesar |
| 2 | Hadi Sumanjaya |
| 3 | Afzal Daniyal Akif |
