const http = require('http');
const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, 'database.json');

// Helper function to read the database file
function readDatabase() {
  try {
    const data = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return 'Welcome to our App Page';
  }
}

// Helper function to save the database file
function saveDatabase(database) {
  try {
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Create a server
const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    // GET Request - Return all data from the database
    const records = readDatabase();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(records));
  } else if (req.url === '/' && req.method === 'POST') {
    // POST Request - Add data to the database
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const newRecord = JSON.parse(body);
      const database = readDatabase();
      database.push(newRecord);
      saveDatabase(database);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newRecord));
    });
  } else if (req.url.startsWith('/update/') && req.method === 'PUT') {
    // PUT Request - Update data in the database
    const recordId = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const updatedFields = JSON.parse(body);
      const database = readDatabase();
      const recordIndex = database.findIndex(record => record.id === recordId);
      if (recordIndex !== -1) {
        database[recordIndex] = { ...database[recordIndex], ...updatedFields };
        saveDatabase(database);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(database[recordIndex]));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Record not found');
      }
    });
  } else if (req.url.startsWith('/delete/') && req.method === 'DELETE') {
    // DELETE Request - Remove data from the database
    const recordId = req.url.split('/')[2];
    const database = readDatabase();
    const recordIndex = database.findIndex(record => record.id === recordId);
    if (recordIndex !== -1) {
      const deletedRecord = database.splice(recordIndex, 1)[0];
      saveDatabase(database);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deletedRecord));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Record not found');
    }
  } else {
    // Invalid URL or method
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL or method');
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
