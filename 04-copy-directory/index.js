
const path = require('path');
const fsPromises = require('fs/promises');
async function findFiles(searchPath) {
    let files = await fsPromises.readdir(path.join(__dirname, ...searchPath), { withFileTypes: true });
    let nFiles = [];
    let nDirectories = [];
    for (let file of files) {
        if (file.isFile()) {
            file.path = searchPath;
            nFiles.push(file);
        }
        else if (file.isDirectory()) {
            file.path = searchPath;
            let newSearchPath = [...searchPath];
            newSearchPath.push(file.name);
            let newFiles = await findFiles(newSearchPath);
            nFiles = [...nFiles, ...newFiles[0]];
            nDirectories.push(file);
        }
    }
    return [nFiles, nDirectories];
}
async function copyMaker() {
    await fsPromises.mkdir(path.join(__dirname, 'files-copy'), { recursive: true });
    let files_directories = await findFiles(['files']);
    let files = files_directories[0];
    let directories = files_directories[1];
    directories.forEach(async (directory) => {
        let newPath = [...directory.path];
        newPath[0] = 'files-copy';
        await fsPromises.mkdir(path.join(__dirname, ...newPath, directory.name), { recursive: true });

    });

    files.forEach(async file => {
        let newPath = [...file.path];
        newPath[0] = 'files-copy';
        await fsPromises.copyFile(path.join(__dirname, ...file.path, file.name), path.join(__dirname, ...newPath, file.name));
    });
}
copyMaker();