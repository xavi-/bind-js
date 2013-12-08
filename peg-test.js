var fs = require("fs");

var PEG = require("pegjs");
var grammar = fs.readFileSync("grammar.pegjs").toString();

var parser = PEG.buildParser(grammar);

var templ = fs.readFileSync("template.bind").toString();
console.log(JSON.stringify(parser.parse(templ), null, "\t"));