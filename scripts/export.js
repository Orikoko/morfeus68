const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Files and directories to exclude from the zip
const excludeList = [
  'node_modules',
  '.next',
  '.git',
  'out',
  'dist',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
];

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputDir, 'project.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`Archive created successfully! Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved to: ${path.join(outputDir, 'project.zip')}`);
});

// Handle warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Function to add files recursively
function addDirectory(dirPath, basePath = '') {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(basePath, file);

    // Skip excluded files and directories
    if (excludeList.includes(file)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      addDirectory(fullPath, relativePath);
    } else {
      archive.file(fullPath, { name: relativePath });
    }
  });
}

// Add all project files
addDirectory(process.cwd());

// Finalize the archive
archive.finalize();