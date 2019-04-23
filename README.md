# dedupe-npm-install

Solution for package duplication problem.

```sh-session
npm i -D dedupe-npm-install
```

Add to package.json

```json
{
  "scripts": {
    "dedupe-npm-install": "NODE_OPTIONS=\"--max-old-space-size=8192\" dedupe-npm-install",
    "prebuild:prod": "npm run dedupe-npm-install",
  }
}
```

Create file `dedupe-npm-install.json`

```json
{
    "target_path": "./node_modules",
    "defaultCollapse": "same",
    "extraCollapse": {
        "lodash": ["*"]
    }
}
```