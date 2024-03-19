import { join, basename, extname, resolve } from "path";
import { spawn } from "child_process";
import { homedir, platform as osPlatform, platform } from "os";
import fs from "fs-extra";
import fkill from "fkill";
import { LocalSettings, ModuleAliases } from "./types.js";
import { arch } from "process";

interface IgorCommands {
  worker:
    | "Windows"
    | "Switch"
    | "Android"
    | "Mac"
    | "Linux"
    | "iOS"
    | "XboxOne"
    | "WinUWP"
    | "XboxSeriesXS";
  command:
    | "PackageZip"
    | "Package"
    | "PackageX64"
    | "PackageDev"
    | "PackageX64Store"
    | "PackageSubmission"
    | "PackageDevXboxOne"
    | "PackageDevXboxSeriesXS"
    | "PackageSubmissionXboxOne"
    | "PackageSubmissionXboxSeriesXS";
}

type CompileCommands = {
  baseCommand: string;
  args: string[];
  destDir: string;
};

export interface Gms2CompileOptions {
  /**
   * GameMaker user profile directory, from
   * .../AppData/Roaming/GameMakerStudio2(-Beta)
   */
  userDir: string;
  projectDir: string;
  exportPlatform: ModuleAliases;

  /**
   * @default 'out'
   */
  destinationDir?: string;
  /**
   * @default 'default'
   */
  config?: string;
  /**
   * Desired executable name with extension
   *
   * Defaults to project's name
   */
  name?: string;
  /**
   * By default yyc is used.
   *
   * @default true
   *
   */
  yyc?: boolean;
}

export class Gms2Compile {
  private readonly localSettings: Partial<LocalSettings>;
  private readonly baseName: string;
  private userDir: string;
  private targetRuntime: string;
  private projectDir: string;
  private exportPlatform: ModuleAliases;
  destinationDir: string;
  private config = "default";
  name: string;
  private yyc = true;
  private runtimePath: string;

  constructor(options: Gms2CompileOptions) {
    this.userDir = options.userDir;
    this.projectDir = options.projectDir;
    if (!fs.existsSync(this.projectDir)) {
      throw new Error(`Project file does not exist: ${this.projectDir}`);
    }
    this.baseName = basename(this.projectDir, extname(this.projectDir)).replace(
      " ",
      "_"
    );
    this.exportPlatform = options.exportPlatform;
    this.destinationDir = options.destinationDir || resolve("out");
    this.config = options.config || "default";
    this.name =
      options.name ||
      `${this.baseName}.${Gms2Compile.inferOutputExtension(this.exportPlatform)}`;

    this.yyc = options.yyc;

    this.localSettings = fs.readJSONSync(
      join(this.userDir, "local_settings.json")
    );

    this.targetRuntime = this.localSettings["targetRuntime"];

    this.runtimePath = //Infer the runtime path
      join(
        this.localSettings["runtimeDir"] as string,
        `runtime-${this.targetRuntime}`
      );
  }

  private _convertToIgorWorker(platform: ModuleAliases) {
    const platformLower = platform.toLocaleLowerCase();
    let worker;
    switch (platformLower) {
      case "android":
        worker = "Android";
        break;
      case "switch":
        worker = "Switch";
        break;
      case "windows":
        worker = "Windows";
        break;
      case "mac":
        worker = "Mac";
        break;
      case "ios":
        worker = "iOS";
        break;
      case "linux":
        worker = "Linux";
        break;
      case "xboxone":
        worker = "XboxOne";
        break;
      case "xboxseriesxs":
        worker = "XboxSeriesXS";
        break;
      default:
        throw new Error(`${platform} is not supported!`);
    }
    return worker as IgorCommands["worker"];
  }

  static inferOutputExtension(platform: ModuleAliases) {
    return (
      {
        windows: "zip",
        linux: "zip",
        mac: "zip",
        android: "aab",
        switch: "nsp",
        ios: "ipa",
        xboxone: "xboxone-pkg",
        ps4: "yoyops",
        html5: "html",
        main: ".zip",
        xboxseriesxs: "xboxseriesxs-pkg",
      }[platform] || ""
    );
  }

  iOSXCodeOutputDir() {
    const buildTempDir = this.localSettings[
      "machine.General Settings.Paths.IDE.TempFolder"
    ] as string;
    return join(buildTempDir, this.baseName, `${this.baseName}.xcodeproj`);
  }

  androidGradleOutputDir() {
    const buildCacheDir = this.localSettings[
      "machine.General Settings.Paths.IDE.AssetCacheFolder"
    ] as string;
    return join(buildCacheDir, "android", this.config);
  }

  androidGradleScriptPath() {
    const gradleRootDir = join(this.runtimePath, "android/runner/gradle");
    if (process.platform === "win32") {
      return join(gradleRootDir, "gradlew.bat");
    } else {
      return join(gradleRootDir, "gradlew");
    }
  }

  private _generateWorkerCommands(
    platform: ModuleAliases,
    generatePublishBuild = false
  ) {
    const worker = this._convertToIgorWorker(platform);

    let command = "Package";
    switch (platform) {
      case "windows":
        command = "PackageZip";
        break;
    }
    return {
      worker,
      command,
    } as IgorCommands;
  }

  private _createCommand() {
    //Clear Cache
    const buildCache = this.localSettings[
      "machine.General Settings.Paths.IDE.AssetCacheFolder"
    ] as string;
    const buildTempDir = this.localSettings[
      "machine.General Settings.Paths.IDE.TempFolder"
    ] as string;

    if (fs.existsSync(buildCache)) fs.removeSync(buildCache);
    if (fs.existsSync(buildTempDir)) fs.removeSync(buildTempDir);

    let baseCommand;

    const args = [];
    const legacyIgor = join(this.runtimePath, "bin/Igor.exe");
    if (fs.existsSync(legacyIgor)) {
      if (osPlatform() == "win32") {
        baseCommand = legacyIgor;
      } else {
        baseCommand = "mono";
        args.push(legacyIgor);
      }
    } else {
      if (osPlatform() == "win32") {
        baseCommand = join(
          this.runtimePath,
          `bin/igor/windows/${arch}`,
          "Igor.exe"
        );
      } else if (osPlatform() == "darwin") {
        baseCommand = join(this.runtimePath, `bin/igor/osx/${arch}`, "Igor");
      } else if (osPlatform() == "linux") {
        baseCommand = join(this.runtimePath, `bin/igor/linux/${arch}`, "Igor");
      } else {
        throw "Unsupported OS";
      }
    }
    if (!fs.existsSync(baseCommand)) {
      throw `Could not find Igor at ${baseCommand}`;
    }

    const buildOptimization = this.yyc ? "YYC" : "VM";

    args.push(
      `/uf=${this.userDir}`,
      `/rp=${this.runtimePath}`,
      `/project=${this.projectDir}`,
      `/cache=${buildCache}`,
      `/temp=${buildTempDir}`,
      `/of=${join(buildTempDir, this.baseName + ".win")}`,
      `/tf=${this.name}`,
      `/config=${this.config}`,
      `/runtime=${buildOptimization}`,
      "/v",
      "/ic",
      "/cr"
    );

    if (fs.existsSync(legacyIgor)) {
      args.push(
        `/ssdk=${this.localSettings["machine.Platform Settings.Steam.steamsdk_path"]}`
      );
    }
    const igorCommand = this._generateWorkerCommands(this.exportPlatform);

    if (["mac"].includes(this.exportPlatform)) {
      const cacheDir = buildCache.replace(/~/gi, homedir());
      const targetOptions = { runtime: buildOptimization };
      const targetOptionsFn = join(cacheDir, "target_options.json");
      fs.ensureFileSync(targetOptionsFn);
      fs.writeJSONSync(targetOptionsFn, targetOptions);
      args.push(`/targetOptions=${targetOptionsFn}`);
    }

    args.push("--", igorCommand.worker, igorCommand.command);

    if (osPlatform() == "darwin") {
      for (const i in args) {
        const home = homedir();
        const regex = /~/gi;
        const oldArg = args[i];
        args[i] = oldArg.replace(regex, home);
      }
    }

    return {
      baseCommand,
      args,
      destDir: this.destinationDir,
    } as CompileCommands;
  }

  private _runCommand(cmd: CompileCommands, envs: any = {}) {
    console.log(cmd.baseCommand);
    console.log(cmd.args.join("\n"));
    console.log([cmd.baseCommand, cmd.args.join(" ")].join(" "));
    console.log(`cwd: ${cmd.destDir}`);

    fs.ensureDirSync(cmd.destDir);
    console.log("Number of processors:");
    console.log(process.env.NUMBER_OF_PROCESSORS);
    const childEnv = Object.assign({}, process.env, envs);
    if (childEnv.PATH && platform() == "win32") {
      //This is because node's the ENV contain the PATH variable that conflicts with MSBuild
      //See https://github.com/dotnet/msbuild/issues/5726
      delete childEnv.PATH;
    }
    console.log(childEnv.NUMBER_OF_PROCESSORS);
    return spawn(cmd.baseCommand, cmd.args, {
      cwd: cmd.destDir,
      env: childEnv,
    });
  }

  async build(envs: any = {}) {
    const cmd = this._createCommand();
    const handle = this._runCommand(cmd, envs);
    if (this.exportPlatform == "android") {
      const androidCleanUp = async () => {
        //Kill the java and adb processes, using fkill and OS specific process names
        const androidProcesses =
          osPlatform() == "win32" ? ["java.exe"] : ["java"];
        for (const processName of androidProcesses) {
          await fkill(processName, { force: true }).catch(async (err) => {
            console.log(processName);
            console.log(err.message);
          });
        }
      };

      handle.stdout.on("data", async (data) => {
        if (
          data.toString().includes("adb kill-server") &&
          this.exportPlatform == "android"
        ) {
          await androidCleanUp();
        }
      });
    }
    return handle;
  }
}
