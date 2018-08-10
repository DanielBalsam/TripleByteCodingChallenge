var fs = require('fs');
var env = fs.readFileSync('config/app.config', 'utf8')
var envVariables = JSON.parse(env);

module.exports = envVariables;
