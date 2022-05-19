const path = require('path');
const fs = require('fs');
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
    await fsPromises.mkdir(path.join(__dirname, 'project-dist', 'assets'), { recursive: true });
    let files_directories = await findFiles(['assets']);
    let files = files_directories[0];
    let directories = files_directories[1];
    directories.forEach(async (directory) => {
        let newPath = ['project-dist', ...directory.path];
        await fsPromises.mkdir(path.join(__dirname, ...newPath, directory.name), { recursive: true });

    });

    files.forEach(async file => {
        let newPath = ['project-dist', ...file.path];
        await fsPromises.copyFile(path.join(__dirname, ...file.path, file.name), path.join(__dirname, ...newPath, file.name));
    });
}
copyMaker();

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

async function findHtmlFiles(searchPath) {
    let files = await fsPromises.readdir(path.join(__dirname, ...searchPath), { withFileTypes: true });
    let nFiles = [];
    for (let file of files) {
        if (file.isFile() && path.extname(path.join(__dirname, ...searchPath, file.name)) === '.html') {
            file.path = searchPath;
            nFiles.push(file);
        }
    }
    return nFiles;
}
async function buildHtml() {
    let files = await findHtmlFiles(['components']);
    await fsPromises.writeFile(path.join(__dirname, 'project-dist', 'index.html'), '');
    const readableStream = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
    let htmlTemplateContent = '';
    readableStream.on('data', chunk => htmlTemplateContent += chunk);
    readableStream.on('end', () => {
        files.forEach(file => {
            const readableStream = fs.createReadStream(path.join(__dirname, 'components', file.name), 'utf-8');
            let htmlPartContent = '';
            const name = file.name.split('.')[0] === '' ? file.name : file.name.split('.').slice(0, -1).join('.');
            readableStream.on('data', chunk => htmlPartContent += chunk);
            readableStream.on('end', async () => {
                htmlTemplateContent = htmlTemplateContent.split(`{{${name}}}`).join(htmlPartContent);
                await fsPromises.writeFile(path.join(__dirname, 'project-dist', 'index.html'), htmlTemplateContent);
            });
        });
    });
}
buildHtml();