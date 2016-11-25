const InsertLine = "<link href='./lib/vconsole.min.js' type='text/css' rel='stylesheet' />";
const fs = require('fs');
var fileArr = [];
var files =  fs.readdirSync('./sitdownrts/');
class operateFile {
    constructor (fileName) {
        console.info(fileName);
        this.fileName = fileName;
        this.fileData = '';
        this.input = fs.createReadStream(fileName);
    }

    readLines () {
        let remaining = '';
        this.input.on('data',(data) => {
            remaining +=data;
            var index = remaining.indexOf('\r'); //windows 平台 \r\n linux 平台\n
            // var index = remaining.indexOf('\n');  linux 平台\n
            var last = 0;
            while (index > -1) {
                let line = remaining.slice(last,index);
                last = index+2; \\window
                // linux last = index+2
                this.saveLine(line);
                index = remaining.indexOf('\r',last);
            }
            remaining = remaining.slice(last);
        });

        this.input.on('end',()=>{
            if (remaining.length > 0) {
                this.saveLine(remaining);
            };
            this.writeAgain(this.fileData);
        })
    }

    saveLine (line) {
        if (line == '</head>') {
            this.fileData = this.fileData + InsertLine +'\n';            
        }
        this.fileData = this.fileData + line+'\n';
    };

    writeAgain (data) {
        let output = fs.createWriteStream(this.fileName,{encoding: 'utf8'});        
        output.write(data);
        output.end();
    }

};
filterFile(files);
function filterFile(arr) {
    arr.forEach((file) => {
        var s = fs.statSync('./sitdownrts/' + file);
        if (s.isFile()) {
            let d = new operateFile('./sitdownrts/' + file);
            d.readLines();
        }
    });
};

