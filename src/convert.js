var argv = require("yargs")
  .strict()
  .usage("Usage: converter -i [<input-file-or-URL>] -o output.json", {
    i: {
        describe: 'specify input file',
        alias: ('i','input')
    },
  })
  .demand(['i'])
  .argv;

var fs = require('fs');
var path = require('path');
var request = require('request');
var LensCoverter = require('lens-converter');
var XmlAdapterForXmlDomXPath = require('./xml_adapter_xmldom_xpath');

function convert(xmlData) {
  console.info("Starting conversion...");
  var xmlAdapter = new XmlAdapterForXmlDomXPath();
  var converter = new LensCoverter({
    xmlAdapter: xmlAdapter
  });
  var article = converter.import(xmlData);
  var outFile = path.join(__dirname, "..", "data", "json", article.id + ".json");
  console.info("Writing file", outFile);
  fs.writeFileSync(outFile, JSON.stringify(article.toJSON(), null, 2));
}

if (/^http.:/.exec(argv.i)) {
  var url = argv.i;
  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      console.error("Could not load data from URL", url);
    } else {
      var xmlData = body;
      convert(xmlData);
    }
  });
} else {
  var inputFile = path.join(__dirname, "..", argv.i);
  if (!fs.existsSync(inputFile)) {
    console.error("Input file not found.");
  } else {
    var xmlData = fs.readFileSync(inputFile, 'utf8');
    convert(xmlData);
  }
}
