# cross-link

Solution for package duplication problem.

```sh-session
npm i -D cross-link
```

Add to package.json

```json
{
  "scripts": {
    "cross-link": "NODE_OPTIONS=\"--max-old-space-size=8192\" cross-link",
    "prebuild:prod": "npm run cross-link",
  }
}
```

Create file `cross-link.json`

```json
{
    "target_path": "./node_modules",
    "defaultCollapse": "same",
    "extraCollapse": {
        "lodash": ["*"]
    }
}
```