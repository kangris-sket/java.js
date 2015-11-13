window.onload = function () {
  io = io.connect();

  var executeButton = document.getElementsByTagName("button")[0];
  var result = document.getElementById("result");
  var busy = document.getElementById("busy");

  io.on('error', function (data) {
    busy.style.display = "none";
    result.value += data + "\n";
  });

  io.on('ok', function (data) {
    result.value += data + "\n";
  });

  io.on('exitcode', function (data) {
    busy.style.display = "none";
    result.value += data + "\n";
  });

  var javaEditor = CodeMirror.fromTextArea(document.getElementById("java-code"), {
    lineNumbers:   true,
    matchBrackets: true,
    mode:          "text/x-java"
  });


  executeButton.onclick = function () {
    result.value = "";
    busy.style.display = "block";
    io.emit('execute', javaEditor.getValue());
  }

};