
const path = require('path');
const fsPromises = require('fs/promises');
async function findFiles(searchPath) {
    let files = await fsPromises.readdir(path.join(__dirname, ...searchPath), { withFileTypes: true });
    let nFiles = [];
    for (let file of files) {
        if (file.isFile()) {
            file.path = searchPath;
            nFiles.push(file);
        }
    }
    return nFiles;
}
async function copyMaker() {
    await fsPromises.mkdir(path.join(__dirname, 'files-copy'), { recursive: true });
    let files = await findFiles(['files']);
    files.forEach(async file => {
        await fsPromises.copyFile(path.join(__dirname, 'files', file.name), path.join(__dirname, 'files-copy', file.name));
    });
}
copyMaker();