# igor-build

Used in tandem with [bscotch/igor-setup](https://github.com/bscotch/igor-setup), this action allows you build GameMaker projects for different platforms.

### Caveats

- Only supports the following build targets:
  - Windows
  - Android
  - iOS (will only export an XCode project, which you can build with [Fastlane](https://docs.fastlane.tools/best-practices/continuous-integration/github/))
- If you are using GitHub Hosted Runners and the build fails, check the [hardware resource specs](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources) and [installed software specs](https://github.com/actions/runner-images?tab=readme-ov-file#software-and-image-support) to make sure that the hosted runner has the right environment for your project
- If you are getting errors like `System.IO.DirectoryNotFoundException: Could not find a part of the path '/home/runner/work/foo/foo/scripts/bar/bar.yy'.` on Ubuntu runners, make sure that the mentioned `.yy` file uses the same casing as it was specified in the `.yyp` file. For example, if the `.yyp` file show `bar.yy` in lower case, but the actual file is in upper case like `Bar.yy`, this error will occur.

## Usage

### Inputs

```yaml
- uses: bscotch/igor-build@v1
  with:
    # The output of bscotch/igor-setup where the license and settings files are set up.
    # Required
    user-dir:

    # The path to the yyp file of a GameMaker project
    # Required
    yyp-path:

    # The export platform. Only support windows, android, and ios at the moment
    # Optional. Default is 'windows' for Windows runner, 'android' for Linux runner, and "ios" for MacOS runner
    platform:

    # The configuration to build for. See https://manual.gamemaker.io/monthly/en/#t=Settings%2FConfigurations.htm
    # Optional. Default is 'Default'
    config:

    # Whether to use YYC or not. See https://manual.gamemaker.io/monthly/en/#t=Settings%2FYoYo_Compiler.htm
    # Optional. Default is 'true'
    yyc:

    # Desired executable name with extension
    # Optional. Defaults to project's name and an inferred extension (demo.zip for Windows, demo.aab for Android, demo.xcodeproj for iOS).
    name:

    # Whether to save the compiler output to a log file. Set to 'true' to enable.
    # Optional. Default is 'false'.
    save-logs:

    # The package type for GX.games export. Must be `OperaGXPackage_Zip`, `OperaGXPackage_Gamestrip`, or `OperaGXPackage_Wallpaper`
    # Optional. Default is `OperaGXPackage_Zip`.
    gx-package-type:
```

### Outputs

| Name       | Description                            | Example                  |
| ---------- | -------------------------------------- | ------------------------ |
| `out-dir`  | The directory containing the export.   | `C:\out\`                |
| `out-name` | The name of the export file            | `example.zip`            |
| `log-dir`  | The path to log file of Igor's output. | `C:\out\igor_output.txt` |

## Examples

See <https://github.com/bscotch/ganary/blob/main/.github/workflows/ci.yml>
