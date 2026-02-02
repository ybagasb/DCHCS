const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Client sederhana untuk download file dari API
 */
class DownloadClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Download file dengan progress tracking
   */
  async download(filename, outputPath) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/download/${filename}`;
      const file = fs.createWriteStream(outputPath);
      
      http.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        let lastProgress = 0;

        console.log(`Mengunduh: ${filename}`);
        console.log(`Ukuran: ${this.formatBytes(totalSize)}`);
        console.log('');

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = Math.floor((downloadedSize / totalSize) * 100);
          
          // Update progress setiap 1%
          if (progress > lastProgress) {
            lastProgress = progress;
            const bar = this.createProgressBar(progress);
            const downloaded = this.formatBytes(downloadedSize);
            const total = this.formatBytes(totalSize);
            process.stdout.write(`\r${bar} ${progress}% (${downloaded}/${total})`);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\n\n✓ Download selesai!');
          console.log(`File disimpan di: ${outputPath}`);
          resolve(outputPath);
        });

        file.on('error', (err) => {
          fs.unlink(outputPath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Download dengan support resume
   */
  async resumeDownload(filename, outputPath) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/download/${filename}`;
      
      // Cek apakah file sudah ada (untuk resume)
      let startByte = 0;
      let mode = 'w';
      
      if (fs.existsSync(outputPath)) {
        const stat = fs.statSync(outputPath);
        startByte = stat.size;
        mode = 'a';
        console.log(`Melanjutkan download dari byte ${startByte}`);
      }

      const file = fs.createWriteStream(outputPath, { flags: mode });
      
      const options = {
        headers: startByte > 0 ? { 'Range': `bytes=${startByte}-` } : {}
      };

      http.get(url, options, (response) => {
        const statusCode = response.statusCode;
        
        if (statusCode !== 200 && statusCode !== 206) {
          reject(new Error(`HTTP ${statusCode}: ${response.statusMessage}`));
          return;
        }

        let totalSize;
        let downloadedSize = startByte;

        if (statusCode === 206) {
          // Partial content
          const contentRange = response.headers['content-range'];
          const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
          totalSize = parseInt(match[1], 10);
        } else {
          totalSize = parseInt(response.headers['content-length'], 10);
        }

        let lastProgress = Math.floor((downloadedSize / totalSize) * 100);

        console.log(`Mengunduh: ${filename}`);
        console.log(`Ukuran total: ${this.formatBytes(totalSize)}`);
        console.log('');

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = Math.floor((downloadedSize / totalSize) * 100);
          
          if (progress > lastProgress) {
            lastProgress = progress;
            const bar = this.createProgressBar(progress);
            const downloaded = this.formatBytes(downloadedSize);
            const total = this.formatBytes(totalSize);
            process.stdout.write(`\r${bar} ${progress}% (${downloaded}/${total})`);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\n\n✓ Download selesai!');
          console.log(`File disimpan di: ${outputPath}`);
          resolve(outputPath);
        });

        file.on('error', (err) => {
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Dapatkan daftar file yang tersedia
   */
  async listFiles() {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/files`;
      
      http.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.files);
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Buat progress bar
   */
  createProgressBar(percentage, width = 40) {
    const filled = Math.floor(width * percentage / 100);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * Format bytes ke human readable
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Contoh penggunaan
async function main() {
  const client = new DownloadClient();

  try {
    // List file yang tersedia
    console.log('Mengambil daftar file...\n');
    const files = await client.listFiles();
    
    if (files.length === 0) {
      console.log('Tidak ada file yang tersedia.');
      console.log('Letakkan file di folder "files/" pada server.');
      return;
    }

    console.log('File yang tersedia:');
    files.forEach((file, i) => {
      console.log(`${i + 1}. ${file.name} (${file.sizeFormatted})`);
    });
    console.log('');

    // Download file pertama sebagai contoh
    if (files.length > 0) {
      const fileToDownload = files[0].name;
      const outputPath = path.join(__dirname, 'downloads', fileToDownload);
      
      // Buat folder downloads jika belum ada
      const downloadsDir = path.join(__dirname, 'downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      console.log(`Memulai download: ${fileToDownload}\n`);
      
      // Gunakan resumeDownload untuk support resume
      await client.resumeDownload(fileToDownload, outputPath);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Jalankan jika file ini dieksekusi langsung
if (require.main === module) {
  main();
}

module.exports = DownloadClient;
