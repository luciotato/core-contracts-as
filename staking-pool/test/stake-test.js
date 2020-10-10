"use strict";
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var spawn_1 = require("./util/spawn");
var nickname = "";
var contractCli = "";
//-----------------------------------
//-----------------------------------
//get testnet created account
var contractAccountFile = path.join("neardev", "dev-account");
//get test account where `near dev-deploy` deployed the contract (if already run)
var contractAccount = fs.readFileSync(contractAccountFile).toString();
spawn_1.view(contractAccount, "get_owner_id");
spawn_1.view(contractAccount, "get_reward_fee_fraction");
spawn_1.call(contractAccount, "deposit", "--amount", "1","--accountId","lucio.testnet");
spawn_1.call(contractAccount, "withdraw_all","--accountId","lucio.testnet");
