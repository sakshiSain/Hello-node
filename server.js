const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Create folder "files" if it doesn't exist
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const fileName = parsedUrl.query.filename;

    if (!fileName) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Filename query parameter is required.');
    }

    const filePath = path.join(FILES_DIR, fileName);

    // CREATE file (POST)
    if (req.method === 'POST' && parsedUrl.pathname === '/create') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            fs.writeFile(filePath, body, err => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error writing file.');
                }
                res.writeHead(201);
                res.end('File created.');
            });
        });
    }

    // READ file (GET)
    else if (req.method === 'GET' && parsedUrl.pathname === '/read') {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(404);
                return res.end('File not found.');
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(data);
        });
    }

    // DELETE file (DELETE)
    else if (req.method === 'DELETE' && parsedUrl.pathname === '/delete') {
        fs.unlink(filePath, err => {
            if (err) {
                res.writeHead(404);
                return res.end('File not found.');
            }
            res.writeHead(200);
            res.end('File deleted.');
        });
    }

    // Invalid route
    else {
        res.writeHead(404);
        res.end('Invalid endpoint.');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
