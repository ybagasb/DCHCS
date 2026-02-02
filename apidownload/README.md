# API Download File

API sederhana untuk mengunduh file besar (hingga 5GB atau lebih) dengan fitur streaming yang efisien.

## Fitur

✅ **Streaming File** - Efisien untuk file besar, tidak memuat seluruh file ke memory
✅ **Resume Download** - Support partial content (HTTP 206) untuk melanjutkan download
✅ **Progress Tracking** - Client bisa track progress download
✅ **Daftar File** - Endpoint untuk melihat file yang tersedia

## Instalasi

```bash
# Install dependencies
npm install

# Jalankan server
npm start

# Atau untuk development dengan auto-reload
npm run dev
```

## Penggunaan

### 1. Jalankan Server

```bash
node download-api.js
```

Server akan berjalan di `http://localhost:3000`

### 2. Siapkan File

Letakkan file yang ingin diunduh di folder `files/`. Folder ini akan otomatis dibuat saat server pertama kali dijalankan.

```bash
# Contoh membuat file dummy 5GB untuk testing
dd if=/dev/zero of=files/test-5gb.bin bs=1M count=5120
```

### 3. Endpoint API

#### Lihat Daftar File
```
GET http://localhost:3000/files
```

Response:
```json
{
  "files": [
    {
      "name": "test-5gb.bin",
      "size": 5368709120,
      "sizeFormatted": "5.00 GB",
      "url": "/download/test-5gb.bin"
    }
  ]
}
```

#### Download File
```
GET http://localhost:3000/download/test-5gb.bin
```

#### Health Check
```
GET http://localhost:3000/health
```

## Contoh Download dengan cURL

### Download Biasa
```bash
curl -O http://localhost:3000/download/test-5gb.bin
```

### Download dengan Progress
```bash
curl -# -O http://localhost:3000/download/test-5gb.bin
```

### Resume Download (melanjutkan download yang terputus)
```bash
curl -C - -O http://localhost:3000/download/test-5gb.bin
```

## Contoh Download dengan JavaScript (Browser/Node.js)

```javascript
// Dengan Fetch API
async function downloadFile(filename) {
  const response = await fetch(`http://localhost:3000/download/${filename}`);
  const blob = await response.blob();
  
  // Save file di browser
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Dengan progress tracking
async function downloadWithProgress(filename) {
  const response = await fetch(`http://localhost:3000/download/${filename}`);
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  
  let receivedLength = 0;
  const chunks = [];
  
  while(true) {
    const {done, value} = await reader.read();
    if (done) break;
    
    chunks.push(value);
    receivedLength += value.length;
    
    const progress = (receivedLength / contentLength) * 100;
    console.log(`Progress: ${progress.toFixed(2)}%`);
  }
  
  const blob = new Blob(chunks);
  // Save blob...
}
```

## Contoh dengan Python

```python
import requests

# Download file
url = 'http://localhost:3000/download/test-5gb.bin'
response = requests.get(url, stream=True)

with open('downloaded-file.bin', 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)
```

## Cara Kerja

1. **Streaming**: File dibaca dan dikirim secara bertahap (chunk by chunk), tidak dimuat seluruhnya ke memory
2. **Range Requests**: Support HTTP Range header untuk partial content, memungkinkan resume download
3. **Efficient**: Cocok untuk file besar karena memory-efficient

## Keamanan

⚠️ API ini adalah contoh sederhana. Untuk production, pertimbangkan:

- Autentikasi dan otorisasi
- Rate limiting
- Validasi filename (prevent path traversal)
- HTTPS
- CORS configuration
- File access control

## Troubleshooting

**Error: ENOENT - File tidak ditemukan**
- Pastikan file ada di folder `files/`
- Cek nama file (case-sensitive)

**Download terputus**
- Gunakan curl dengan flag `-C -` untuk resume
- Atau gunakan download manager yang support resume

**Memory tinggi saat download**
- Ini tidak seharusnya terjadi dengan streaming
- Cek apakah ada middleware yang buffer seluruh response
