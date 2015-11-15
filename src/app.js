var expressIO = require("express.io");
var ezLogger = require("ezlogger");
var common = require("./common");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var os = require("os");
var fs = require("fs");
var path = require("path");

ezLogger(function () {
  return __dirname + "/../logs/" + Date.simple.more() + ".txt";
});

var app = expressIO();
console.info("application initialized");

app.http().io();

app.use(expressIO.static(__dirname + "/public"));

app.use(function (request, response, next) {
  console.log("[{method}] {headers.host}{url} from {ip}", request);
  next();
});

var processList = [];

app.io.route('kill', function (req) {
  var data = req.data;

  if (processList[data]) {
    processList[data].kill();
    delete processList[data];
  }
});

app.io.route('execute', function (req) {
  var data = req.data;
  var name = Math.random() * 100000000 | 0;
  var dir = path.resolve(os.tmpdir() + "/" + name);
  var className = /public class (\w+)/.exec(data)[1];
  var location = path.resolve(dir + "/" + className);

  if(/Runtime|ProcessBuilder/i.exec(data)) {
    return req.io.emit('error', 'no sir :( just no');
  }

  fs.mkdir(dir, function (err) {
    if (err) {
      return req.io.emit('error', err);
    }

    fs.writeFile(location + ".java", data, function (err) {
      if (err) {
        return req.io.emit('error', err);
      }


      exec('javac ' + location + ".java", function (err, stdout, stderr) {
        if (err) {
          return req.io.emit('error', stderr.split(dir).join(""));
        }

        console.log(data);

        var javaApp = spawn('java', [className], {cwd: dir});
        console.info("{0} alive", name);

        javaApp.stdout.on('data', function (data) {
          req.io.emit('ok', data.toString());
        });

        javaApp.stderr.on('data', function (data) {
          req.io.emit('error', data.toString().split(dir).join(""));
        });

        javaApp.on('exit', function (exitCode) {
          console.info("{0} died, cause: {1}", name, exitCode == null ? "user" : exitCode == 0 ? "natural" : "run time error");
          req.io.emit('exitcode', "exit code: {0} id: {1}".format((exitCode == null ? "killed" : exitCode), name));
        });

        req.io.emit('alive', name);

        processList[name] = javaApp;
      });

    });
  });

});


app.listen(1234);
console.info("application started to listen at {port}", app.server.address());