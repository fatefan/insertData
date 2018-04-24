var package = require('./package.json');
const fs = require('fs');
const os = require('os');
var fileArr = [];
const dirArr = ['./sitdownrts/', './sitdownrts/dist/html/']
const InsertLine = '<meta name="version" content="' + package.version + '">';
var LF, LFL;
const platform = os.platform();
if (platform === 'win32') {
    LF = '\r\n';
    LFL = 2;
} else {
    LF = '\n';
    LFL = 1;
}
class operateFile {
    constructor(fileName) {
        this.fileName = fileName;
        this.fileData = ''
        this.input = fs.createReadStream(fileName)
    }

    readLines() {
        let remaining = '';
        this.input.on('data', (data) => {
            remaining += data;
            var index = remaining.indexOf(LF);
            var last = 0;
            while (index > -1) {
                let line = remaining.slice(last, index);
                last = index + LFL;
                this.saveLine(line);
                index = remaining.indexOf(LF, last);
            }
            remaining = remaining.slice(last);
        });

        this.input.on('end', () => {
            if (remaining.length > 0) {
                this.saveLine(remaining);
            };
            this.writeAgain(this.fileData);
        })
    }
    saveLine(line) {
        this.fileData = this.fileData + line + LF;
        if (line == '<head>') {
            this.fileData = this.fileData + InsertLine + LF;
        }
    };
    writeAgain(data) {
        let output = fs.createWriteStream(this.fileName, { encoding: 'utf8' });
        output.write(data);
        output.end();
    }
}
function filterFile(arr, p) {
    arr.forEach((file) => {
        var s = fs.statSync(p + file);
        let split = file.split('.')
        let fileType = split[split.length - 1]
        if (s.isFile() && (fileType == 'html' || fileType == 'jsp')) {
            let d = new operateFile(p + file);
            d.readLines();
        }
    });
};

for (let i = 0, l = dirArr.length; i < l; i++) {
    let p = dirArr[i];
    let files = fs.readdirSync(p);
    filterFile(files, p);
}