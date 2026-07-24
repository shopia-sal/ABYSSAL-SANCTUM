# 🌊 Abyssal Sanctum — WebXR 3D & 360° Underwater Experience

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![A-Frame](https://img.shields.io/badge/A--Frame-EF2D5E?style=for-the-badge&logo=aframe&logoColor=white)
![WebXR](https://img.shields.io/badge/WebXR-000000?style=for-the-badge&logo=webxr&logoColor=white)

**Abyssal Sanctum** adalah aplikasi web interaktif 3D & 360° berbasis **Three.js** dan **A-Frame (WebXR)** yang mengajak pengguna menjelajahi reruntuhan kuil samudra bawah laut, etalase museum kaca 3D, prasasti kuno, serta Guardian laut agung.

---

## 🌟 Fitur Utama (Key Features)

### 🌊 Scene 1 — Abyssal Sanctum (Eksplorasi 3D & Museum Bawah Laut)
- **Sistem Navigasi Berenang 6-DOF**: Bergerak bebas dalam ruang 3D (WASD untuk berenang, SPASI untuk naik, SHIFT untuk turun).
- **Mekanik Penembak Plankton Bioluminescent**: Melepaskan obor bola plankton bercahaya dengan efek apung (*buoyancy*) fisik air.
- **5 Etalase Museum Kotak Kaca 3D (*Museum Glass Cabinets*)**:
  - 📦 **Box (Kubus)** — *Kubus Energi Purba* (`#ffb703`)
  - 🔮 **Sphere (Bola)** — *Orb Samudra Sanctum* (`#00f5d4`)
  - 🏛️ **Cylinder (Tabung)** — *Pilar Prasasti Kuil* (`#f72585`)
  - ⭕ **Torus (Cincin)** — *Cincin Kehidupan Laut* (`#38b000`)
  - 🔺 **Cone (Kerucut)** — *Piramida Kristal Abyssal* (`#7209b7`)
- **Pencahayaan Atmosferik**: *Volumetric God-Rays* (sinar laut), ubin lorong bercahaya cyan, partikel spora karang, dan ubur-ubur melayang.
- **Portal Gerbang 3D**: Gerbang portal berpijar dengan deteksi klik raycaster (hingga 45m) & proksimitas untuk berpindah ke Scene 2.

### 📜 Scene 2 — Hall of Ancient Relics (Panorama 360° Interactive)
- **Lingkungan Panorama 360°**: Visual samudra 360° yang diputar bebas.
- **Hover Info Panel Hologram (`onmouseenter`)**: Mengarahkan kursor ke hotspot artefak (Trisula, Prasasti Purba, Kristal Karang, Kompas Laut) otomatis menampilkan modal informasi hologram berpijar.
- **Portal VR 3D Navigasi**: Pintu navigasi 3D ke Scene 1 dan Scene 3.

### 🐉 Scene 3 — Guardian Chamber (Model 3D Interaktif)
- **Model 3D GLTF Leviathan Guardian**: Mahakarya penjaga kuil bawah laut.
- **Interaksi Klik 3D (360° Spin & Light Surge)**: Mengklik model 3D memicu animasi rotasi 360° yang dinamis, peningkatan intensitas cahaya (*surge*), dan pembukaan modal metadata Guardian.
- **Portal VR 3D Navigasi**: Pintu navigasi 3D kembali ke Scene 2 atau Scene 1.

---

## 🎮 Skema Kontrol (Controls & Keybindings)

| Tombol / Aksi | Fungsi |
| :--- | :--- |
| **W / A / S / D** | Berenang Ke Depan / Kiri / Belakang / Kanan |
| **SPASI (Space)** | Naik Berenang Ke Atas |
| **SHIFT Left** | Turun Berenang Ke Bawah |
| **Mouse Movement** | Memutar Kamera 360° (Pointer Lock) |
| **Klik Kiri (Scene 1)** | Melepaskan Plankton Bioluminescent / Klik Portal |
| **Hover Kursor (Scene 2)** | Membuka Panel Informasi Artefak |
| **Klik Model (Scene 3)** | Memutar Model 3D 360° & Membuka Modal Guardian |
| **ESC** | Melepaskan Kursor dari Layar |

---

## 📁 Struktur Proyek (Project Structure)

```text
abyssal-sanctum/
├── index.html                  # Halaman Utama (Scene 1: Abyssal Sanctum)
├── scene2.html                 # Halaman Scene 2 (Hall of Relics 360°)
├── scene3-model.html           # Halaman Scene 3 (Guardian Chamber 3D Model)
├── main.js                     # Script Render Loop, Raycaster, & Shooter (Scene 1)
├── world.js                    # Pembuatan Geometri Kuil, Museum Glass Cases, & Portal
├── player.js                   # Logika Pergerakan Player & Pointer Lock Controls
├── shooter.js                  # Logika Penembak Plankton Cahaya
├── DOKUMENTASI_FITUR_GALERI.md # Dokumentasi Rinci Fitur Galeri
├── README.md                   # Dokumentasi Utama Proyek GitHub
└── assets/                     # Tekstur Gambar, Panorama 360, & Model GLTF 3D
```

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Core**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6 Modules)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) (v0.160.0)
- **VR/360 WebXR Framework**: [A-Frame](https://aframe.io/) (v1.4.2)
- **Typography**: Google Fonts (*Cinzel* & *Outfit*)

---

## 🚀 Cara Menjalankan (Getting Started)

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/abyssal-sanctum.git
   cd abyssal-sanctum
   ```

2. **Jalankan via Local Web Server**:
   Karena proyek ini menggunakan ES6 Modules dan aset 3D (`.glb`), proyek ini harus dijalankan melalui web server lokal (misalnya menggunakan extension **Live Server** di VS Code):
   - Buka folder proyek di VS Code.
   - Klik kanan pada `index.html` dan pilih **Open with Live Server**.
   - Buka browser modern (Google Chrome, Microsoft Edge, atau Firefox).

3. **Mulai Eksplorasi**:
   Klik tombol **"JELAJAHI SANCTUM ➔"** pada layar awal dan nikmati pengalaman peradaban samudra Abyssal Sanctum!

---

## 📜 Lisensi & Atribusi

Proyek ini dikembangkan untuk kebutuhan WebXR Capstone & Interactive 3D Web Application. Bebas digunakan dan dikembangkan untuk tujuan pembelajaran.
