const fs = require('fs');

var filePath = '/Users/davideantelmo/Code/texui/package.json'
var result = fs.readFileSync(filePath,'utf8');
console.log(result)