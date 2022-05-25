const fs = require('fs');
const path = require('path');

const { stdout, stdin, exit } = process;
stdout.write('Enter text:\n');
stdin.on('data', (data) => {
    const readableData = data.toString();
    if (readableData.trim() == 'exit') {
        exit();
    }
    fs.appendFile(path.join(__dirname, 'destination.txt'), readableData, (err) => {
        if (err) throw err;
    });
});
process.on('exit', () => stdout.write('\nGood luck!'));
process.on('SIGINT', () => {
    exit();
});
