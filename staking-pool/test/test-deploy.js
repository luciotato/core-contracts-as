"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var mkPath = require("./util/mkPath");
var color = require("./util/color.js");
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
//-----------------------------------
// helper fn near => spawn near-cli
//-----------------------------------
function near(command, args, options) {
    args.unshift(command);
    return spawn("near", args, options);
}
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
//-----------------------------------
//-----------------------------------
console.log("---------- START TESTNET DEPLOY TESTS ---------");
var validNetworks = ["test", "testnet", "ci", "development", "local"];
if (!validNetworks.includes(process.env.NODE_ENV)) {
    color.logErr("NODE_ENV must be one of: " + validNetworks.join("|"));
    process.exit(1);
}
var basedir = path.join(__dirname, "..", "..");
if (basedir.startsWith("\\"))
    basedir = basedir.slice(1); // windows compat remove extra "\"
basedir = path.relative(process.cwd(), basedir);
console.log("basedir: " + basedir);
// create project dir
var outDir = path.join(basedir, "out");
process.stdout.write("Creating dir " + outDir + "/...");
try {
    mkPath.create(outDir);
}
catch (ex) {
    color.logErr("can't mkdir " + outDir);
    throw (ex);
}
color.greenOK();
//get testnet created account
var contractAccountFile = path.join(basedir, "neardev", "dev-account");
var contractAccount;
//get test account where `near dev-deploy` deployed the contract (if already run)
try {
    contractAccount = fs.readFileSync(contractAccountFile).toString();
}
catch (_a) {
    contractAccount = undefined;
}
if (contractAccount) {
    // delete account
    var result = near("delete", [contractAccount, "lucio.testnet"], { ignoreExitStatus: true });
    if (result == 0)
        fs.unlinkSync(contractAccountFile); //rm file
}
var wasmFile = path.join(basedir, "build", "debug", "staking-pool.wasm");
//deploy the contract with near dev-deploy
near("dev-deploy", [wasmFile]);
//get contract account
contractAccount = fs.readFileSync(contractAccountFile).toString();
// near("state", [contractAccount]);
//create a user account different from the contract account
// var userAccount = "user." + contractAccount;
// near("create-account", [userAccount, "--masterAccount", contractAccount], { ignoreExitStatus: true });

//test call fn "new" - init the contract
call(contractAccount,"new",  JSON.stringify({owner_id:userAccount, 
                stake_public_key:"BnLACoaywKGfAEoeKn5HuiAzpn1NTcjTuUkjs44dMiPp", 
                reward_fee_fraction: { numerator:8, denominator:100}} ));
view(contractAccount, "get_owner_id");
view(contractAccount, "get_reward_fee_fraction");
call(contractAccount, "deposit", "--amount", "1");
call(contractAccount, "withdraw_all");
//-------------
// cleanup
//-------------
{
    // delete user account
    near("delete", [userAccount, contractAccount], { ignoreExitStatus: true });
    // delete contract account
    var result = near("delete", [contractAccount, "lucio.testnet"], { ignoreExitStatus: true });
    if (result == 0)
        fs.unlinkSync(contractAccountFile); //rm file
}
console.log("---------- END TESTNET DEPLOY TESTS ---------");
