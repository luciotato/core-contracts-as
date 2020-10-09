"use strict";

var path = require("path");
var fs = require("fs");
var color = require("./util/color.js");
var spawn_1 = require("./util/spawn");
var nickname = "";
var contractCli = "";
//-----------------------------------
//-----------------------------------
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
if (contractAccount) {
    // delete account
    var result = spawn_1.near("delete", [contractAccount, "lucio.testnet"], { ignoreExitStatus: true });
    if (result == 0)
        fs.unlinkSync(contractAccountFile); //rm file
}
var wasmFile = path.join("..", "build", "debug", "staking-pool.wasm");

//deploy the contract with near dev-deploy
spawn_1.near("dev-deploy", [wasmFile]);

//get contract account
contractAccount = fs.readFileSync(contractAccountFile).toString();

// near("state", [contractAccount])
//create a user account different from the contract account
// const userAccount = `user.${contractAccount}`
// near("create-account", [userAccount, "--masterAccount", contractAccount], { ignoreExitStatus: true })
//test call fn "new" - init the contract

spawn_1.call(contractAccount, "init", JSON.stringify({
    owner_id: contractAccount,
    stake_public_key: "BnLACoaywKGfAEoeKn5HuiAzpn1NTcjTuUkjs44dMiPp",
    reward_fee_fraction: { numerator: 8, denominator: 100 }}).replace(/"/g,'\\"'),
    "--accountId",contractAccount
);
