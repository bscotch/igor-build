import * as core from "@actions/core";
import { Gms2Compile, Gms2CompileOptions } from "@/igor-build";
import path from "path";
import fs from "fs-extra";
import os from "os";

export async function run() {
  try {
    const user_dir = core.getInput("user-dir");
    const yyp_path = core.getInput("yyp-path");
    let platform = core.getInput("platform");
    const config = core.getInput("config") || "Default";
    const yyc = core.getInput("yyc") === "true";
    const save_logs = core.getInput("save-logs") === "false";
    const name = core.getInput("name");

    if (!platform) {
      platform = "windows";
      if (os.type() == "Darwin") {
        platform = "ios";
      } else if (os.type() == "Linux") {
        platform = "android";
      }
    }

    const options: Gms2CompileOptions = {
      userDir: user_dir,
      projectDir: yyp_path,
      exportPlatform: platform,
      yyc,
      config,
      name,
    };

    const compiler = new Gms2Compile(options);
    const child = await compiler.build();

    if (save_logs) {
      const logFile = path.resolve(
        `${compiler.name}_${platform}_${config}_build.log`
      );
      fs.removeSync(logFile);
      const writeStream = fs.createWriteStream(logFile);
      child.stdout.pipe(writeStream);
      child.stderr.pipe(writeStream);
      core.setOutput("log-dir", logFile);
    }

    child.stdout.on("data", (data) => {
      core.info(data.toString());
    });

    child.stderr.on("data", (data) => {
      core.error(data.toString());
    });

    await new Promise((resolve, reject) => {
      child.on("close", (code) => {
        if (code == 0) {
          resolve(`Compile completed successfully`);
        } else {
          reject(`child process exited with code ${code}`);
        }
      });
    });

    let outName = compiler.name;
    let outDir = compiler.destinationDir;
    if (platform === "ios") {
      outDir = path.dirname(compiler.iOSXCodeOutputDir());
      outName = path.basename(compiler.iOSXCodeOutputDir());
    }

    core.info(`Completed building.`);
    core.setOutput("out-name", outName);
    core.setOutput("out-dir", outDir);
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
