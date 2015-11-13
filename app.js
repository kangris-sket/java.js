var expressIO = require("express.io");
var ezLogger = require("ezlogger");
var common = require("./common");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var os = require("os");
var fs = require("fs");
var path = require("path");

ezLogger(function () {
  return __dirname + "/logs/" + Date.simple.more() + ".txt";
});

var app = expressIO();
console.info("application initialized");

app.http().io();

app.use(function (request, response, next) {
  console.log("[{method}] {headers.host}{url} from {ip}", request);
  next();
});

app.use(expressIO.static(__dirname + "/public"));

app.io.route('execute', function (req) {
  var data = req.data;
  var name = Math.random() * 100000000 | 0;
  var dir = path.resolve(os.tmpdir() + "/" + name);
  var className = /public class (\w+)/.exec(data)[1];
  var location = path.resolve(dir + "/" + className);

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

        var javaApp = spawn('java', [className], {cwd: dir}, function (err, stdout, stderr) {
          if (err) {
            return req.io.emit('error', stderr.split(dir).join(""));
          }

          return req.io.emit('ok', stdout);
        });

        var kill = setTimeout(function () {
          console.warn("{0} killed due timeout!", name);
          kill = null;
          javaApp.kill();
        }, 10000);

        javaApp.stdout.on('data', function (data) {
          req.io.emit('ok', data.toString());
        });

        javaApp.stderr.on('data', function (data) {
          req.io.emit('error', data.toString().split(dir).join(""));
        });

        javaApp.on('exit', function (exitCode) {
          if (kill != null) clearTimeout(kill);
          req.io.emit('exitcode', "exit code: " + (exitCode == null ? "terminated due timeout" : exitCode));
        });
      });

    });
  });

});


app.listen(1234);
console.info("application started to listen at {port}", app.server.address());