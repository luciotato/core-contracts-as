"use strict";
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var color = require("./util/color.js");
var spawn_1 = require("./util/spawn");
var nickname = "";
var contractCli = "";
//-----------------------------------
//-----------------------------------
console.log("---------- START TESTNET DEPLOY TESTS ---------");
var validNetworks = ["test", "testnet", "ci", "development", "local"];
if (!validNetworks.includes(process.env.NODE_ENV)) {
    color.logErr("NODE_ENV must be one of: " + validNetworks.join("|"));
    process.exit(1);
}
//get testnet created account
var contractAccountFile = path.join("neardev", "dev-account");
var contractAccount;
//get test account where `near dev-deploy` deployed the contract (if already run)
try {
    contractAccount = fs.readFileSync(contractAccountFile).toString();
}
catch (_a) {
    contractAccount = undefined;
}
//-------------
// cleanup
//-------------
{
    // delete user account
    // near("delete", [userAccount, contractAccount], { ignoreExitStatus: true })
    // delete contract account
    var result = spawn_1.near("delete", [contractAccount, "lucio.testnet"], { ignoreExitStatus: true });
    if (result == 0)
        fs.unlinkSync(contractAccountFile); //rm file
}
