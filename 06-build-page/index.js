const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');


async function findCssFiles(searchPath) {
    let files = await fsPromises.readdir(path.join(__dirname, ...searchPath), { withFileTypes: true });
    let nFiles = [];
    for (let file of files) {
        if (file.isFile() && path.extname(path.join(__dirname, ...searchPath, file.name)) === '.css') {
            file.path = searchPath;
            nFiles.push(file);
        }
    }
    return nFiles;
}
async function bundleStyles() {
    let files = await findCssFiles(['styles']);
    await fsPromises.writeFile(path.join(__dirname, 'project-dist', 'style.css'), '');
    files.forEach(async file => {
        const readableStream = fs.createReadStream(path.join(__dirname, ...file.path, file.name), 'utf-8');
        readableStream.on('data', async chunk => {

            await fsPromises.appendFile(path.join(__dirname, 'project-dist', 'style.css'), chunk);
        });
    });
}
bundleStyles();