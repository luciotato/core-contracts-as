import * as color from './color.js'
import * as child_process from "child_process"

let nickname: string = "";
let contractCli: string = "";

//-----------------------------------
// helper fn spawn 
//-----------------------------------
export function spawn(cmd: string, args: string[], options?: Record<string, unknown>): number {

    const spawnOptions: child_process.CommonSpawnOptions = {
        shell: true, // shell:true => to be able to invoke on windows
        //cwd: basedir,
        stdio: "inherit"
    }

    if (!options || !options["hideCommand"]) console.log(color.yellow, ">", cmd, ...args, color.normal)
    const execResult = child_process.spawnSync(cmd, args, spawnOptions)
    if (execResult.error) {
        color.logErr(execResult.error.message)
        process.exit(5)
    }
    if (execResult.status !== 0 && (!options || options["ignoreExitStatus"] == false)) {
        color.logErr(`exit status:${execResult.status}: ${cmd} ${args.join(" ")}`)
        process.exit(execResult.status)
    }
    return execResult.status
}
//-----------------------------------
// helper fn near => spawn near-cli
//-----------------------------------
export function near(command: string, args: string[], options?: Record<string, unknown>): number {
    args.unshift(command)
    return spawn("near", args, options)
}
//-----------------------------------
// helper fn node => spawn node
//-----------------------------------
function node(command: string, args: string, options?: Record<string, unknown>): number {
    const argsArray = args.split(" ")
    argsArray.unshift(command)
    return spawn("node", argsArray, options)
}
//-----------------------------------
// helper fn view => spawn near view
//-----------------------------------
export function view(...args: string[]): number {
    args.unshift("view")
    return spawn("near", args)
}
//-----------------------------------
// helper fn call => spawn near call
//-----------------------------------
export function call(...args: string[]): number {
    args.unshift("call")
    return spawn("near", args)
}

