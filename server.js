const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'src', req.url === '/' ? 'index.html' : req.url);
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
        case '.jsx':
        case '.ts':
        case '.tsx':
        case '.mjs':
            contentType = 'application/javascript; charset=utf-8';
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            break;
        case '.css':
            contentType = 'text/css; charset=utf-8';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.png':
            contentType = 'image/png';
            break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, 'public', 'index.html'), (error, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});