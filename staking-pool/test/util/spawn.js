"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.call = exports.view = exports.near = exports.spawn = void 0;
var color = require("./color.js");
var child_process = require("child_process");
var nickname = "";
var contractCli = "";
//-----------------------------------
// helper fn spawn 
//-----------------------------------
function spawn(cmd, args, options) {
    var spawnOptions = {
        shell: true,
        //cwd: basedir,
        stdio: "inherit"
    };
    if (!options || !options["hideCommand"])
        console.log.apply(console, __spreadArrays([color.yellow, ">", cmd], args, [color.normal]));
    var execResult = child_process.spawnSync(cmd, args, spawnOptions);
    if (execResult.error) {
        color.logErr(execResult.error.message);
        process.exit(5);
    }
    if (execResult.status !== 0 && (!options || options["ignoreExitStatus"] == false)) {
        color.logErr("exit status:" + execResult.status + ": " + cmd + " " + args.join(" "));
        process.exit(execResult.status);
    }
    return execResult.status;
}
exports.spawn = spawn;
//-----------------------------------
// helper fn near => spawn near-cli
//-----------------------------------
function near(command, args, options) {
    args.unshift(command);
    return spawn("near", args, options);
}
exports.near = near;
//-----------------------------------
// helper fn node => spawn node
//-----------------------------------
function node(command, args, options) {
    var argsArray = args.split(" ");
    argsArray.unshift(command);
    return spawn("node", argsArray, options);
}
//-----------------------------------
// helper fn view => spawn near view
//-----------------------------------
function view() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args.unshift("view");
    return spawn("near", args);
}
exports.view = view;
//-----------------------------------
// helper fn call => spawn near call
//-----------------------------------
function call() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args.unshift("call");
    return spawn("near", args);
}
exports.call = call;
