## Smart City Kaltim - Sistem Pelaporan Layanan Publik

LKs Cloud Computing 2026 - Provinsi Kalimantan Timur Peserta :Muhammad Jubair Al Hakim - Kode Peserta :MJA-282E3B5F

Sistem Layanan public dan laporan warga

===

REST API lengkap untuk sistem layanan publik dan laporan warga, dibangun dengan Node.js (Express), PostgreSQL, dan JWT Authentication. Siap di-deploy menggunakan Docker atau AWS (ECS Fargate + RDS) melalui Terraform.

\---

## Daftar Isi

* [Fitur](#fitur)
* [Teknologi](#teknologi)
* [Struktur Proyek](#struktur-proyek)
* [Prasyarat](#prasyarat)
* [Instalasi \& Menjalankan Lokal](#instalasi--menjalankan-lokal)
* [Menjalankan dengan Docker](#menjalankan-dengan-docker)
* [Deploy ke AWS dengan Terraform](#deploy-ke-aws-dengan-terraform)
* [Variabel Lingkungan](#variabel-lingkungan)
* [Daftar Endpoint API](#daftar-endpoint-api)
* [Format Respons JSON](#format-respons-json)
* [Autentikasi](#autentikasi)
* [Role \& Hak Akses](#role--hak-akses)
* [Status Laporan](#status-laporan)

\---

## Fitur

* **Autentikasi JWT** — Register, login, token dengan masa berlaku yang dapat dikonfigurasi
* **Role-Based Access Control (RBAC)** — Dua role: `admin` dan `citizen` dengan hak akses berbeda
* **Layanan Publik** — CRUD layanan yang bisa diakses publik tanpa autentikasi
* **Laporan Warga** — Citizen mengirim laporan, admin mengelola dan memperbarui status
* **Notifikasi Otomatis** — Citizen mendapat notifikasi setiap kali status laporan berubah
* **Dashboard Admin** — Statistik ringkasan laporan dan pengguna
* **Pagination** — Semua endpoint bertipe list menggunakan pagination default 10 per halaman
* **Validasi Input** — Setiap endpoint memvalidasi input dengan pesan error yang konsisten
* **Respons JSON Konsisten** — Format `{ success, message, data, meta }` di seluruh endpoint

\---

## Teknologi

|Komponen|Teknologi|
|-|-|
|Runtime|Node.js 20|
|Framework|Express 4|
|Database|PostgreSQL 16|
|ORM|Sequelize 6|
|Autentikasi|JSON Web Token (JWT)|
|Password Hashing|bcrypt|
|Containerisasi|Docker + Docker Compose|
|Infrastruktur|Terraform (AWS ECS Fargate + RDS + ALB)|

\---

## Struktur Proyek

```
app/
├── src/
│   ├── app.js                          # Entry point — server \& route registration
│   ├── config/
│   │   └── database.js                 # Konfigurasi Sequelize via env var
│   ├── models/
│   │   ├── User.js                     # Model pengguna (role: admin | citizen)
│   │   ├── Service.js                  # Model layanan publik
│   │   ├── Report.js                   # Model laporan warga
│   │   └── Notification.js             # Model notifikasi
│   ├── controllers/
│   │   ├── auth.controller.js          # Register \& login
│   │   ├── service.controller.js       # CRUD layanan publik
│   │   ├── report.controller.js        # CRUD laporan + update status
│   │   ├── notification.controller.js  # Ambil \& tandai notifikasi
│   │   └── admin.controller.js         # Dashboard \& manajemen user
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── service.route.js
│   │   ├── report.route.js
│   │   ├── notification.route.js
│   │   └── admin.route.js
│   ├── middlewares/
│   │   ├── auth.middleware.js          # verifyToken — validasi JWT
│   │   └── role.middleware.js          # requireRole — batasi akses per role
│   └── utils/
│       ├── response.js                 # Helper successRes \& errorRes
│       └── notification.helper.js      # createNotification (dipanggil internal)
├── terraform/
│   ├── main.tf                         # Root Terraform — memanggil semua module
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   ├── modules/
│   │   ├── vpc/                        # VPC, subnet, IGW, NAT Gateway
│   │   ├── alb/                        # Application Load Balancer
│   │   ├── ecs/                        # ECS Fargate, ECR, IAM, CloudWatch
│   │   └── rds/                        # RDS PostgreSQL
│   └── environments/
│       └── production/                 # Config siap pakai untuk production
├── Dockerfile                          # Multi-stage build (builder → production)
├── docker-compose.yml                  # API + PostgreSQL + pgAdmin
├── docker-compose.override.yml         # Override untuk development (hot-reload)
├── .env.example                        # Template variabel lingkungan
├── .gitignore
└── package.json
```

\---

## Prasyarat

### Untuk menjalankan lokal

* [Node.js](https://nodejs.org/) >= 20
* [PostgreSQL](https://www.postgresql.org/) >= 16

### Untuk menjalankan dengan Docker

* [Docker](https://www.docker.com/) >= 24
* [Docker Compose](https://docs.docker.com/compose/) >= 2.20

### Untuk deploy ke AWS

* [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.6
* [AWS CLI](https://aws.amazon.com/cli/) sudah terkonfigurasi (`aws configure`)
* Akun AWS dengan permission IAM yang cukup

\---

## Instalasi \& Menjalankan Lokal

```bash
# 1. Clone atau extract proyek
cd app

# 2. Install dependency
npm install

# 3. Salin dan isi file .env
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda (lihat bagian Variabel Lingkungan)

# 4. Buat database di PostgreSQL
psql -U postgres -c "CREATE DATABASE api\_db;"

# 5. Jalankan server — tabel otomatis terbuat oleh Sequelize
npm run dev      # development (hot-reload dengan nodemon)
npm start        # production
```

Server berjalan di: `http://localhost:3000`

> \*\*Catatan:\*\* Tabel database dibuat otomatis saat server pertama kali dijalankan melalui `sequelize.sync()`. Tidak perlu menjalankan migrasi manual.

\---

## Menjalankan dengan Docker

### Development (dengan hot-reload dan pgAdmin)

```bash
# 1. Salin dan isi .env
cp .env.example .env
# Minimal isi JWT\_SECRET

# 2. Jalankan semua service
docker compose --profile dev up --build
```

|Service|URL|
|-|-|
|API|http://localhost:3000|
|pgAdmin (GUI database)|http://localhost:5050|

Login pgAdmin: `admin@admin.com` / `admin`

### Production (tanpa hot-reload)

```bash
docker compose -f docker-compose.yml up --build -d
```

### Perintah berguna Docker

```bash
# Melihat log API secara real-time
docker compose logs -f api

# Masuk ke dalam container API
docker exec -it api\_app sh

# Hentikan semua container
docker compose down

# Hentikan dan hapus volume database (HATI-HATI: data hilang permanen)
docker compose down -v

# Rebuild image setelah ada perubahan kode
docker compose up --build
```

\---

## Deploy ke AWS dengan Terraform

Terraform akan membuat infrastruktur berikut di AWS region `ap-southeast-1` (Singapore):

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  VPC (10.0.0.0/16)                      │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Subnet Publik│  │  Subnet Privat   │ │
│  │              │  │                  │ │
│  │  ALB ────────┼──►  ECS Fargate     │ │
│  │  (port 80)   │  │  (Node.js API)   │ │
│  │              │  │       │          │ │
│  │              │  │       ▼          │ │
│  │              │  │  RDS PostgreSQL  │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
        CloudWatch Logs ◄── ECS Fargate
```

### Langkah deploy

```bash
# 1. Masuk ke folder terraform
cd terraform

# 2. Salin dan isi file tfvars
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — isi db\_password, jwt\_secret, container\_image

# 3. Inisialisasi Terraform (unduh provider)
terraform init

# 4. Lihat rencana perubahan sebelum apply
terraform plan

# 5. Terapkan infrastruktur (\~10–15 menit)
terraform apply
```

Setelah selesai, Terraform menampilkan output:

```
alb\_dns\_name       = "api-proyek-production-alb-xxx.ap-southeast-1.elb.amazonaws.com"
ecr\_repository\_url = "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/api-proyek-production"
ecs\_cluster\_name   = "api-proyek-production-cluster"
```

### Build \& push Docker image ke ECR

```bash
# Login ke ECR
aws ecr get-login-password --region ap-southeast-1 | \\
  docker login --username AWS --password-stdin <ECR\_URL>

# Build image
docker build -t api-proyek .

# Tag dan push
docker tag api-proyek:latest <ECR\_URL>:latest
docker push <ECR\_URL>:latest
```

Setelah push, ECS akan otomatis mengunduh image terbaru dan menjalankan container.

### Resource AWS yang dibuat Terraform

|Resource|Keterangan|
|-|-|
|VPC|Network terisolasi dengan 2 AZ|
|Subnet Publik|2 subnet untuk ALB|
|Subnet Privat|2 subnet untuk ECS \& RDS|
|Internet Gateway|Akses internet untuk subnet publik|
|NAT Gateway|Akses internet keluar untuk subnet privat|
|ALB|Load balancer publik di port 80|
|ECS Cluster|Cluster untuk menjalankan Fargate tasks|
|ECS Task Definition|Konfigurasi container (CPU, memori, env var)|
|ECS Service|Menjaga jumlah task yang berjalan|
|ECR Repository|Registry Docker image|
|RDS PostgreSQL 16|Database managed di subnet privat|
|CloudWatch Log Group|Log container tersimpan 30 hari|
|IAM Role|Permission minimal untuk ECS task execution|
|Security Groups|Firewall per resource|

### Menghapus semua infrastruktur

```bash
terraform destroy
```

\---

## Variabel Lingkungan

Salin `.env.example` menjadi `.env` dan isi nilainya:

|Variabel|Wajib|Default|Keterangan|
|-|-|-|-|
|`PORT`||`3000`|Port server|
|`DB\_HOST`|✓||Host PostgreSQL|
|`DB\_PORT`||`5432`|Port PostgreSQL|
|`DB\_NAME`|✓||Nama database|
|`DB\_USER`|✓||Username database|
|`DB\_PASS`|✓||Password database|
|`JWT\_SECRET`|✓||Secret key JWT — minimal 32 karakter acak|
|`JWT\_EXPIRES\_IN`||`7d`|Masa berlaku token (contoh: `24h`, `7d`, `30d`)|

\---

## Daftar Endpoint API

Base URL lokal: `http://localhost:3000`

### Autentikasi — Publik

|Method|Endpoint|Keterangan|
|-|-|-|
|`POST`|`/auth/register`|Registrasi akun baru (role default: `citizen`)|
|`POST`|`/auth/login`|Login dan dapatkan token JWT|

**Contoh request register:**

```json
POST /auth/register
{
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "password": "password123"
}
```

**Contoh request login:**

```json
POST /auth/login
{
  "email": "budi@email.com",
  "password": "password123"
}
```

\---

### Layanan Publik

|Method|Endpoint|Akses|Keterangan|
|-|-|-|-|
|`GET`|`/services`|Publik|Daftar layanan (pagination)|
|`GET`|`/services/:id`|Publik|Detail satu layanan|
|`POST`|`/services`|Admin|Tambah layanan baru|
|`PUT`|`/services/:id`|Admin|Update layanan|
|`DELETE`|`/services/:id`|Admin|Hapus layanan|

**Query parameter GET /services:**

|Parameter|Default|Keterangan|
|-|-|-|
|`page`|`1`|Halaman ke-|
|`limit`|`10`|Jumlah item per halaman|
|`search`||Filter berdasarkan judul|
|`category`||Filter berdasarkan kategori|

\---

### Laporan Warga

|Method|Endpoint|Akses|Keterangan|
|-|-|-|-|
|`POST`|`/reports`|Auth|Kirim laporan baru|
|`GET`|`/reports`|Auth|Daftar laporan|
|`GET`|`/reports/:id`|Auth|Detail laporan|
|`PATCH`|`/reports/:id/status`|Admin|Update status laporan|

> Citizen hanya dapat melihat laporan miliknya sendiri. Admin dapat melihat semua laporan.

**Query parameter GET /reports:**

|Parameter|Default|Keterangan|
|-|-|-|
|`page`|`1`|Halaman ke-|
|`limit`|`10`|Jumlah item per halaman|
|`status`||Filter: `pending`, `in\_progress`, `resolved`, `rejected`|
|`category`||Filter berdasarkan kategori|

**Contoh request kirim laporan:**

```json
POST /reports
{
  "title": "Jalan berlubang di Jl. Sudirman",
  "description": "Terdapat lubang besar yang membahayakan pengguna jalan",
  "category": "infrastruktur",
  "location": "Jl. Sudirman No. 10, Jakarta Pusat"
}
```

**Contoh request update status (admin):**

```json
PATCH /reports/:id/status
{
  "status": "in\_progress"
}
```

\---

### Notifikasi

|Method|Endpoint|Akses|Keterangan|
|-|-|-|-|
|`GET`|`/notifications`|Auth|Daftar notifikasi milik user yang login|
|`PATCH`|`/notifications/:id/read`|Auth|Tandai satu notifikasi sudah dibaca|
|`PATCH`|`/notifications/read-all`|Auth|Tandai semua notifikasi sudah dibaca|

**Query parameter GET /notifications:**

|Parameter|Default|Keterangan|
|-|-|-|
|`page`|`1`|Halaman ke-|
|`limit`|`10`|Jumlah item per halaman|
|`read`||Filter: `true` (sudah dibaca) atau `false` (belum dibaca)|

\---

### Dashboard Admin

|Method|Endpoint|Akses|Keterangan|
|-|-|-|-|
|`GET`|`/admin/dashboard`|Admin|Statistik ringkasan laporan \& pengguna|
|`GET`|`/admin/users`|Admin|Daftar semua pengguna (pagination)|
|`PATCH`|`/admin/users/:id/role`|Admin|Ubah role pengguna|

**Query parameter GET /admin/users:**

|Parameter|Default|Keterangan|
|-|-|-|
|`page`|`1`|Halaman ke-|
|`limit`|`10`|Jumlah item per halaman|
|`role`||Filter: `admin` atau `citizen`|
|`search`||Cari berdasarkan nama|

\---

## Format Respons JSON

Semua endpoint mengembalikan format yang konsisten.

### Sukses (dengan data tunggal)

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "uuid",
      "name": "Budi Santoso",
      "email": "budi@email.com",
      "role": "citizen"
    }
  }
}
```

### Sukses (dengan pagination)

```json
{
  "success": true,
  "message": "Daftar laporan",
  "data": \[ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error validasi

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": \[
    { "field": "email", "message": "Format email tidak valid" },
    { "field": "password", "message": "Password minimal 6 karakter" }
  ]
}
```

### Error umum

```json
{
  "success": false,
  "message": "Token tidak valid atau kadaluarsa"
}
```

### Kode HTTP yang digunakan

|Kode|Keterangan|
|-|-|
|`200`|OK — request berhasil|
|`201`|Created — data berhasil dibuat|
|`400`|Bad Request — input tidak valid|
|`401`|Unauthorized — token tidak ada atau tidak valid|
|`403`|Forbidden — role tidak memiliki akses|
|`404`|Not Found — data tidak ditemukan|
|`409`|Conflict — data duplikat (contoh: email sudah terdaftar)|
|`500`|Internal Server Error|

\---

## Autentikasi

Endpoint yang memerlukan autentikasi harus menyertakan header:

```
Authorization: Bearer <token\_jwt>
```

Token didapatkan dari response `POST /auth/login`. Token berlaku selama nilai `JWT\_EXPIRES\_IN` di `.env` (default: 7 hari).

**Contoh menggunakan curl:**

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..." \\
  http://localhost:3000/reports
```

\---

## Role \& Hak Akses

|Endpoint|Publik|Citizen|Admin|
|-|:-:|:-:|:-:|
|`POST /auth/register`|✓|✓|✓|
|`POST /auth/login`|✓|✓|✓|
|`GET /services`|✓|✓|✓|
|`GET /services/:id`|✓|✓|✓|
|`POST/PUT/DELETE /services`|||✓|
|`POST /reports`||✓|✓|
|`GET /reports`||✓ (milik sendiri)|✓ (semua)|
|`GET /reports/:id`||✓ (milik sendiri)|✓|
|`PATCH /reports/:id/status`|||✓|
|`GET /notifications`||✓|✓|
|`PATCH /notifications/\*/read`||✓|✓|
|`GET /admin/dashboard`|||✓|
|`GET /admin/users`|||✓|
|`PATCH /admin/users/:id/role`|||✓|

\---

## Status Laporan

Alur status laporan yang dapat diperbarui oleh admin:

```
pending  ──►  in\_progress  ──►  resolved
   │                            
   └──────────────────────────► rejected
```

|Status|Keterangan|
|-|-|
|`pending`|Laporan baru masuk, menunggu ditindaklanjuti|
|`in\_progress`|Laporan sedang dalam proses penanganan|
|`resolved`|Laporan telah selesai ditangani|
|`rejected`|Laporan ditolak (tidak valid atau duplikat)|

Setiap perubahan status akan otomatis mengirim notifikasi ke citizen pelapor.

