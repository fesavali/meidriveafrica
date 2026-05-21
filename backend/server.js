const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from project root
app.use(express.static(__dirname));

// Handle all routes
app.get('*', (req, res) => {
  let filePath = req.path.slice(1);
  
  if (!filePath) {
    filePath = 'index.html';
  }
  
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    res.status(404).send('404: File Not Found');
  }
});

// For local development & Render
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For Vercel
module.exports = app;
