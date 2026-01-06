import { expect } from "chai";
import path from "path";
import dotenv from "dotenv";
import fs from "fs-extra";
import { Gms2Compile, Gms2CompileOptions } from "@/igor-build.js";
import { ModuleAliases } from "@/types.js";
import os from "os";
import { spawn } from "child_process";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sandboxPath = path.resolve("sandbox");
fs.ensureDirSync(sandboxPath);
const outDir = path.resolve(sandboxPath, "out");
const yypPath = process.env.YYP;
const config = process.env.CONFIG;
const userDir = process.env.USERDIR;
const yyc = process.env.YYC == "true" ? true : false;
let platforms: ModuleAliases[];

if (process.env.TARGETPLATFORMS) {
  platforms = process.env.TARGETPLATFORMS?.split(",") as ModuleAliases[];
} else {
  platforms = ["windows"];
  if (os.type() == "Darwin") {
    platforms = ["ios"];
  } else if (os.type() == "Linux") {
    platforms = ["android", "operagx"];
  }
}

async function resetSandbox() {
  await fs.remove(sandboxPath);
}

describe("GMS Compile", async function () {
  this.timeout(0);
  before(async function () {
    await resetSandbox();
  });

  describe("Compiling", async function () {
    it("Can make platform packages", async function () {
      for (const platform of platforms) {
        const options: Gms2CompileOptions = {
          userDir,
          projectDir: yypPath,
          exportPlatform: platform,
          destinationDir: outDir,
          yyc,
          config,
        };
        const compiler = new Gms2Compile(options);
        const child = await compiler.build();
        child.stdout.on("data", (data) => {
          console.log(data.toString());
        });

        child.stderr.on("data", (data) => {
          console.error(data.toString());
        });

        await new Promise((resolve, reject) => {
          child.on("close", resolve);
        });

        let outFileDir = path.join(outDir, compiler.name);
        if (platform == "ios") {
          outFileDir = compiler.iOSXCodeOutputDir();
        }
        expect(
          fs.existsSync(outFileDir),
          `Output file should be at: ${outFileDir}`,
        ).to.be.true;
      }
    });
  });
});
