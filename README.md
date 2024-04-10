# igor-build

Used in tandem with bscotch/igor-setup, this action allows you build GameMaker projects for different platforms.

### Caveats

- Only supports the following build targets:
  - Windows
  - Android
  - iOS (will only export an XCode project, which you can build with [Fastlane](https://docs.fastlane.tools/best-practices/continuous-integration/github/))

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

    # Whehter to use YYC or not. See https://manual.gamemaker.io/monthly/en/#t=Settings%2FYoYo_Compiler.htm
    # Optional. Default is 'true'
    yyc:

    # Desired executable name with extension
    # Optional. Defaults to project's name and an inferred extension.
    name:

    # Whether to save the compiler output to a log file. Set to 'true' to enable.
    # Optional. Default is 'false'.
    save-logs:
```

### Outputs

| Name       | Description                            | Example                  |
| ---------- | -------------------------------------- | ------------------------ |
| `out-dir`  | The directory containing the export.   | `C:\out\`                |
| `out-name` | The name of the export file            | `example.zip`            |
| `log-dir`  | The path to log file of Igor's output. | `C:\out\igor_output.txt` |

## Examples

### Upload an Individual File

See <https://github.com/bscotch/ganary/.github/workflows/ci.yml>
