const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2'); // Import mysql2 untuk koneksi database

const PORT = 3000;

// Koneksi ke Database MySQL (MariaDB)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'siberi'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Fungsi untuk melayani file statis
const serveStaticFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};

// Server HTTP
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      serveStaticFile(res, path.join(__dirname, 'login.html'), 'text/html');
    } else if (req.url === '/index.html') {
      // Menampilkan index.html dan ambil data berita dan profil
      const queryNews = 'SELECT * FROM news ORDER BY published_at DESC LIMIT 5'; // Ambil 5 berita terbaru
      const queryProfile = 'SELECT * FROM profile WHERE id = ?'; // Ambil profil pengguna berdasarkan ID

      // Ambil data profil pengguna (misalnya berdasarkan userID yang disimpan dalam session atau token)
      const userId = 1; // Gantilah dengan ID pengguna yang login, bisa disesuaikan dengan mekanisme login yang Anda buat

      db.query(queryNews, (err, newsResults) => {
        if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Internal Server Error' }));
        } else {
          db.query(queryProfile, [userId], (err, profileResults) => {
            if (err) {
              console.error('Database error:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Internal Server Error' }));
            } else {
              // Menggabungkan data berita dan profil pengguna
              const profile = profileResults[0];
              const news = newsResults;

              // Kirimkan index.html dengan data dinamis
              serveStaticFile(res, path.join(__dirname, 'index.html'), 'text/html');
              
              // Anda bisa menggunakan template engine seperti EJS atau Handlebars di sini untuk menggantikan data dalam HTML
              // Untuk saat ini, Anda dapat mengirim data melalui JavaScript di frontend
            }
          });
        }
      });
    } else if (req.url.endsWith('.css')) {
      serveStaticFile(res, path.join(__dirname, req.url), 'text/css');
    } else if (req.url.endsWith('.js')) {
      serveStaticFile(res, path.join(__dirname, req.url), 'application/javascript');
    } else if (req.url.startsWith('/images/')) {
      const extname = path.extname(req.url);
      const contentType = extname === '.jpg' || extname === '.jpeg' ? 'image/jpeg' : 'image/png';
      serveStaticFile(res, path.join(__dirname, req.url), contentType);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } else if (req.method === 'POST' && req.url === '/auth/signin') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      const query = 'SELECT first_name, id FROM users WHERE email = ? AND password = ?';
      db.query(query, [email, password], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Internal Server Error' }));
        } else if (results.length > 0) {
          const userName = results[0].first_name;
          const userId = results[0].id;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Login successful', name: userName, userId: userId, redirect: '/index.html' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
      });
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
