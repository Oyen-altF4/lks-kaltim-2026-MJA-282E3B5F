# REST API — Node.js + Express + PostgreSQL

API lengkap dengan autentikasi JWT, RBAC (Admin & Citizen), laporan warga, notifikasi, dan dashboard admin.

## Prasyarat

- Node.js >= 16
- PostgreSQL >= 13

## Cara menjalankan

```bash
# 1. Install dependency
npm install

# 2. Salin dan isi file .env
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda

# 3. Jalankan server (development)
npm run dev

# 4. Jalankan server (production)
npm start
```

## Variabel Lingkungan (.env)

| Key | Keterangan |
|-----|-----------|
| PORT | Port server (default: 3000) |
| DB_HOST | Host database PostgreSQL |
| DB_PORT | Port PostgreSQL (default: 5432) |
| DB_NAME | Nama database |
| DB_USER | Username database |
| DB_PASS | Password database |
| JWT_SECRET | Secret key untuk JWT (minimal 32 karakter) |
| JWT_EXPIRES_IN | Masa berlaku token (contoh: 7d, 24h) |

## Daftar Endpoint

### Autentikasi (Publik)
| Method | Path | Keterangan |
|--------|------|-----------|
| POST | /auth/register | Registrasi pengguna baru |
| POST | /auth/login | Login & dapatkan token JWT |

### Layanan Publik
| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /services | Publik | Daftar layanan (pagination) |
| GET | /services/:id | Publik | Detail layanan |
| POST | /services | Admin | Tambah layanan |
| PUT | /services/:id | Admin | Update layanan |
| DELETE | /services/:id | Admin | Hapus layanan |

### Laporan Warga
| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| POST | /reports | Auth | Kirim laporan |
| GET | /reports | Auth | Daftar laporan (citizen: milik sendiri) |
| GET | /reports/:id | Auth | Detail laporan |
| PATCH | /reports/:id/status | Admin | Update status laporan |

### Notifikasi
| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /notifications | Auth | Daftar notifikasi |
| PATCH | /notifications/:id/read | Auth | Tandai dibaca |
| PATCH | /notifications/read-all | Auth | Tandai semua dibaca |

### Dashboard Admin
| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /admin/dashboard | Admin | Statistik ringkasan |
| GET | /admin/users | Admin | Daftar pengguna |
| PATCH | /admin/users/:id/role | Admin | Ubah role pengguna |

## Format Respons

### Sukses
```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [
    { "field": "email", "message": "Format email tidak valid" }
  ]
}
```

## Autentikasi

Sertakan header berikut pada setiap request yang memerlukan autentikasi:

```
Authorization: Bearer <token_jwt>
```

## Status Laporan

Urutan status laporan: `pending` → `in_progress` → `resolved` / `rejected`

## Role

- `citizen` — Warga biasa, bisa membuat dan melihat laporan miliknya sendiri
- `admin` — Administrator, bisa mengelola semua data
