window.onload = function () {
  io = io.connect();

  var executeButton = document.getElementsByTagName("button")[0];
  var alive = false;
  var freeze = false;
  var id = null;

  var javaEditor = CodeMirror.fromTextArea(document.getElementById("java-code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-java",
    extraKeys: {
      Tab: function (cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
      }
    }
  });

  var resultEditor = CodeMirror.fromTextArea(document.getElementById("result"), {
    lineNumbers: false,
    matchBrackets: false,
    height: "dynamic",
    mode: "text/x-console-out"
  });

  var errorReg = /\.java:(\d+)\:/g;
  var errorLines = [];
  io.on('error', function (data) {
    alive = false;
    freeze = false;
    id = null;
    executeButton.innerText = "Execute";

    resultEditor.setValue(resultEditor.getValue() + data);

    var find;
    while(find = errorReg.exec(data)) {
      var line = +find[1] - 1;
      errorLines.push(line);
      javaEditor.addLineClass(line, "background", "error");
    }
  });

  io.on('ok', function (data) {
    resultEditor.setValue(resultEditor.getValue() + data);
  });

  io.on('exitcode', function (data) {
    alive = false;
    executeButton.innerText = "Execute";
    resultEditor.setValue(resultEditor.getValue() + data);
  });

  io.on('alive', function (data) {
    alive = true;
    freeze = false;

    executeButton.innerText = "Kill";
    id = data;
  });

  resultEditor.setOption("theme", "monokai");


  executeButton.onclick = function () {
    if (freeze) return;
    if (alive == false) {
      var line;
      while(line = errorLines.pop()) {
        javaEditor.removeLineClass(line, "background", "error");
      }
      freeze = true;
      resultEditor.setValue("");
      executeButton.innerText = "compiling...";

      io.emit('execute', javaEditor.getValue());
    } else {
      io.emit('kill', id);
    }
  }

};