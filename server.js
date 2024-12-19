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
      const queryNews = 'SELECT * FROM news ORDER BY published_at DESC LIMIT 5';
      const queryProfile = 'SELECT * FROM profile WHERE id = ?';
      const userId = 1;

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
              serveStaticFile(res, path.join(__dirname, 'index.html'), 'text/html');
            }
          });
        }
      });
    } else if (req.url === '/other_pages/user.html') {
      serveStaticFile(res, path.join(__dirname, 'other_pages', 'user.html'), 'text/html');
    }
      else if (req.url.endsWith('.css')) {
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
  } else if (req.method === 'POST') {
    if (req.url === '/auth/signin') {
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
    } else if (req.url === '/auth/signup') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { email, firstName, lastName, password } = JSON.parse(body);

        // Periksa apakah email sudah digunakan
        const checkQuery = 'SELECT email FROM users WHERE email = ?';
        db.query(checkQuery, [email], (err, results) => {
          if (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
          } else if (results.length > 0) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email already in use' }));
          } else {
            // Masukkan data pengguna baru ke database
            const insertQuery = 'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [email, firstName, lastName, password], (err) => {
              if (err) {
                console.error('Database error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
              } else {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User registered successfully', redirect: '/index.html' }));
              }
            });
          }
        });
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
