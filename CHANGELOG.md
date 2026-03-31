# Changelog

## [1.3.2](https://github.com/bscotch/igor-build/compare/v1.3.1...v1.3.2) (2026-03-31)


### Bug Fixes

* The Windows YYC symbol path is now inferred based on a search result rather than a hardcoded path. ([e2f3ce5](https://github.com/bscotch/igor-build/commit/e2f3ce5ece5d325290be4c933b5a1128ac9d3cf5))

## [1.3.1](https://github.com/bscotch/igor-build/compare/v1.3.0...v1.3.1) (2026-03-30)


### Bug Fixes

* Only wrap the project dir in quotes on Windows so it doesn't break on other platforms ([aae4ffa](https://github.com/bscotch/igor-build/commit/aae4ffa9035be00cdea26a47c445b348c6f77379))

## [1.3.0](https://github.com/bscotch/igor-build/compare/v1.2.0...v1.3.0) (2026-03-30)


### Features

* Add output for the Windows YYC symbols directory. ([3a8a103](https://github.com/bscotch/igor-build/commit/3a8a103e7f802fad692ac3fd843d26a6be106392))
* normalize baseName to alphanumeric with underscores ([cbe8010](https://github.com/bscotch/igor-build/commit/cbe80103db5467293aa85e5d62eb193969627c91))


### Bug Fixes

* yyp project with blank space in path fails to build. ([3659898](https://github.com/bscotch/igor-build/commit/3659898bb5cccccdb7f7f881e03873e53db609fb))

## [1.2.0](https://github.com/bscotch/igor-build/compare/v1.1.0...v1.2.0) (2026-01-06)


### Features

* Added support for GX.games export. ([6f92f77](https://github.com/bscotch/igor-build/commit/6f92f77b8a9005d028a9415bd34f7dbb4ed91b16))


### Bug Fixes

* Using full path for /tf option for igor to be compatible for GX.games export. ([6f92f77](https://github.com/bscotch/igor-build/commit/6f92f77b8a9005d028a9415bd34f7dbb4ed91b16))

## [1.1.0](https://github.com/bscotch/igor-build/compare/v1.0.4...v1.1.0) (2025-11-24)


### Features

* Added support for Xbox. ([a8627fa](https://github.com/bscotch/igor-build/commit/a8627faed26382657250b172a17030ffa7dbb055))


### Bug Fixes

* dependencies update. ([09d5355](https://github.com/bscotch/igor-build/commit/09d5355b9b0542a7f72921c02a294bfadf4476b6))
* Force using cmd.exe shell on Windows to resolve the issue with xbox. ([bea7426](https://github.com/bscotch/igor-build/commit/bea74263d25f0385dd78ef1f5f003b9656a539c9))
* If the config is set to "default", normalize it to "Default". ([a8627fa](https://github.com/bscotch/igor-build/commit/a8627faed26382657250b172a17030ffa7dbb055))

## [1.0.4](https://github.com/bscotch/igor-build/compare/v1.0.3...v1.0.4) (2024-11-06)


### Bug Fixes

* Log the error message when the build fails. ([c3cf78a](https://github.com/bscotch/igor-build/commit/c3cf78ab8ccc5e897c0d86e131cac4ed001cb7af))

## [1.0.3](https://github.com/bscotch/igor-build/compare/v1.0.2...v1.0.3) (2024-10-09)


### Bug Fixes

* CI for Android ([b6cb24d](https://github.com/bscotch/igor-build/commit/b6cb24d4e36e512076a20f330f483da983cd3ae5))
* Env has to be set a step before the referencing it. ([b2d1b5c](https://github.com/bscotch/igor-build/commit/b2d1b5c43b6c1b79a4607f426a9ee3846e40521c))
