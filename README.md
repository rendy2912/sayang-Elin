# love-website

Website hadiah romantis untuk Elinn.

## Cara pakai

1. Taruh file musikmu di `assets/music.mp3` (nama file **harus** persis `music.mp3`).
2. Buka `index.html` di browser untuk cek dulu sebelum upload.

## Upload ke GitHub Pages

1. Buat repo baru di GitHub, misalnya `love-website` (bisa public atau private — Pages gratis butuh public untuk akun biasa).
2. Upload 4 item ini ke root repo: `index.html`, `style.css`, `script.js`, folder `assets/` (yang sudah berisi `music.mp3`).
   - Lewat web: klik **Add file → Upload files**, drag semua file/folder, lalu **Commit changes**.
   - Atau lewat git:
     ```
     git init
     git add .
     git commit -m "love website"
     git branch -M main
     git remote add origin https://github.com/USERNAME/love-website.git
     git push -u origin main
     ```
3. Di repo, buka **Settings → Pages**.
4. Di bagian **Build and deployment → Source**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
6. Tunggu 1-2 menit, lalu buka link yang muncul (formatnya `https://USERNAME.github.io/love-website/`).
