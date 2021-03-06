
var PythonShell = require('python-shell');
var express = require('express');

var app = express();

function getPythonOption(command, target){
    var args = [command];
    if (target){
        args.push(target);
    }
    return {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: '/home/pi/psoc_2_pi/API_Python_v_1_1_1',
        args: args
    };
}

/*
var pyshell = new PythonShell('ventilation_controler_rpisoc.py', getPythonOption("btn"));
pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    if (err) throw err;
    console.log('finished');
});*/


function serveCommand(req, res, command, target){
    var options = getPythonOption(command, target);

    PythonShell.run('ventilation_controler_rpisoc.py', options, function (err, results) {
        if (err) {
            console.error(err);
            res.status(404).send(err);
        }
        // results is an array consisting of messages collected during execution
        //console.log('results : %j', results);
        var result = "N/A";
        if (results && results.length > 0){
            result = results[0];
        }
        console.log("Command : " + command + " target : " + target +" result: " + result + " " + new Date());
        res.send(result);
    });
}

function serveStatus(req, res){
    serveCommand(req, res, "status");
}

function serveSwitch(req, res){
    console.log(JSON.stringify(req.query, null, 4));
    console.log(JSON.stringify(req.body, null, 4));
    serveCommand(req, res, "switch",  req.query['target']);
}

app.get('', serveStatus);
app.get('/status', serveStatus);
app.get('/switch', serveSwitch);
app.post('/switch', serveSwitch);

var server = app.listen(80, function() {
    console.log('Listening on port %d', server.address().port);
});