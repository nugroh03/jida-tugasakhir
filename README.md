# Marina Boat - Aplikasi Pemesanan Kapal



Aplikasi web untuk pemesanan kapal wisata dan pancing, dibangun dengan Next.js, TypeScript, dan Prisma. Aplikasi ini menyediakan platform bagi pengguna untuk menyewa kapal dan bagi admin untuk mengelola data kapal dan transaksi.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Panduan Instalasi](#panduan-instalasi)
- [Cara Penggunaan](#cara-penggunaan)
  - [Akun Demo](#akun-demo)
  - [Simulasi Pembayaran](#simulasi-pembayaran)

## Tentang Proyek

Aplikasi ini memungkinkan pengguna untuk melihat, memilih, dan memesan kapal untuk berbagai keperluan seperti wisata atau memancing. Terdapat dua peran utama dalam sistem:

-   👤 **User**: Dapat melakukan registrasi, login, melihat katalog kapal, dan melakukan pemesanan yang terintegrasi dengan payment gateway.
-   👑 **Admin**: Memiliki akses ke dashboard khusus untuk mengelola data kapal (CRUD), melihat transaksi, dan mengatur sistem.

## Fitur Utama

-   🔐 **Autentikasi & Otorisasi**:
    -   Signup & Signin untuk pengguna.
    -   Login berbasis peran (User & Admin) menggunakan NextAuth.js.
-   🚤 **Manajemen Kapal (Admin)**:
    -   CRUD (Create, Read, Update, Delete) untuk data kapal melalui dashboard.
    -   Upload gambar kapal yang terintegrasi dengan ImageKit.
-   🛒 **Pemesanan & Pembayaran (User)**:
    -   Proses booking kapal yang mudah dan intuitif.
    -   Integrasi dengan payment gateway **Duitku** (mode Sandbox) untuk simulasi pembayaran.
-   📊 **Dashboard Admin**:
    -   Antarmuka khusus untuk admin mengelola sistem.
    -   Pengelolaan transaksi pengguna.
-   🚀 **Tampilan Modern & Responsif**:
    -   Dibangun dengan Tailwind CSS untuk UI yang bersih dan dapat diakses di berbagai perangkat.
    -   Manajemen state sisi klien dengan Redux Toolkit untuk pengalaman pengguna yang mulus.

## Teknologi yang Digunakan

-   **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Backend**: Next.js API Routes
-   **Database**: [Prisma](https://www.prisma.io/) (dengan database pilihan Anda, misal: PostgreSQL, MySQL)
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
-   **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
-   **Penyimpanan Gambar**: [ImageKit](https://imagekit.io/)
-   **Ikon**: [Lucide React](https://lucide.dev/)

## Panduan Instalasi

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1.  **Prasyarat**
    -   Node.js (v18.x atau lebih baru)
    -   NPM, Yarn, atau PNPM
    -   Database (contoh: PostgreSQL, MySQL)

2.  **Clone Repository**
    ```bash
    git clone https://github.com/username/repository-name.git
    cd repository-name
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Setup Environment Variables**
    Buat file `.env.local` di root direktori dan isi dengan variabel yang dibutuhkan.
    ```env
    # URL Database dari provider Anda
    DATABASE_URL="your_database_connection_string"

    # Konfigurasi NextAuth
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="generate_a_secret_key_here" # Anda bisa generate di https://generate-secret.vercel.app/

    # Kunci API dari ImageKit.io
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
    NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="your_imagekit_url_endpoint"
    ```

5.  **Jalankan Migrasi Database**
    Perintah ini akan membuat tabel-tabel yang dibutuhkan di database Anda sesuai skema Prisma.
    ```bash
    npx prisma migrate dev
    ```

6.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```
    Buka http://localhost:3000 di browser Anda.

## Cara Penggunaan

### Akun Demo

Anda dapat menggunakan kredensial berikut untuk login:

-   **Admin**
    -   **Email**: `admin1@example.com`
    -   **Password**: `admin123+`
-   **User**
    -   **Email**: `user2@example.com`
    -   **Password**: `123456`

### Simulasi Pembayaran

Payment gateway yang digunakan adalah mode **sandbox** agar bisa disimulasikan.

1.  Login sebagai `user`.
2.  Pilih kapal dan lanjutkan ke proses pemesanan.
3.  Setelah checkout, Anda akan mendapatkan nomor **Virtual Account**.
4.  Kunjungi link berikut untuk mensimulasikan pembayaran:
    **Duitku Sandbox Payment Simulator**
5.  Masukkan nomor Virtual Account dan nominal pembayaran yang sesuai untuk menyelesaikan transaksi.
