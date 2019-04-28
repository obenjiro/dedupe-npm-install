const fs = require('fs-extra')
const path = require('path')
const semver = require('semver')
const dirTree = require('async-directory-tree')

let config = {}

if (fs.existsSync(path.join(process.cwd(), 'dedupe-npm-install.json'))) {
  config = require(path.join(process.cwd(), 'dedupe-npm-install.json'))
}

async function crawl(path, options) {
  const tree = await dirTree(path, options, item => {
    if (item.extension === '.json') {
      item.content = fs.readFileSync(item.path, 'utf-8')
      try {
        item.ast = JSON.parse(item.content)
      } catch (e) {
        console.log(`Failed to parse ${path}: ` + e.message)
      }
    }
  })
  return tree
}

function getAllPackages(tree) {
  let packages = []

  if (tree.name === 'package.json') {
    const package = JSON.parse(tree.content)
    packages.push({
      v: package.version,
      name: package.name,
      path: tree.path,
    })
  }

  if (tree.children) {
    packages = tree.children.reduce((result, child) => {
      return result.concat(getAllPackages(child))
    }, [])
  }

  return packages
}

function getPackagesInfo(data) {
  const packages = getAllPackages(data)
  const hash = packages
    .sort((a, b) => a.path.length - b.path.length)
    .reduce((result, package) => {
      if (!result[package.name]) result[package.name] = []
      result[package.name].push(package)
      return result
    }, {})
  const result = Object.keys(hash).map(key => {
    return {
      key,
      value: hash[key],
    }
  })
  return result
}

function getCollapseFns(config, item) {
  const defaultCollapse = config.defaultCollapse || 'same'
  const extraCollapse = config.extraCollapse || {}

  const collapse = (extraCollapse[item.key] || [defaultCollapse]).filter(
    (v, i, a) => a.indexOf(v) === i
  )
  const versions = item.value
    .map(item => item.v)
    .filter((v, i, a) => a.indexOf(v) === i)
  const collapseCustom = collapse
    .filter(r => r !== 'same')
    .map(rule => {
      return v => semver.satisfies(v, rule)
    })
  const collapseSame = collapse.some(r => r === 'same')
    ? versions.map(rule => {
        return v => semver.satisfies(v, rule)
      })
    : []
  return collapseCustom.concat(collapseSame)
}

module.exports = async function main() {
  const target_path = path.join(process.cwd(), config.path || './node_modules')
  const data = await crawl(target_path, {
    exclude: /(tests|test)/,
    extensions: /\.(json)$/,
  })

  const info = getPackagesInfo(data)

  const jobs = info.map(item => {
    const collapseFns = getCollapseFns(config, item)

    const groups = collapseFns.map(collapseFn => {
      return item.value.filter(item => collapseFn(item.v))
    })

    const jobs = groups
      .filter(group => group.length > 1)
      .map(group => {
        const sortedGroup = group.sort((a, b) => semver.rcompare(a.v, b.v))
        const fromItem = sortedGroup[0]
        const from = path.resolve(path.dirname(fromItem.path))

        sortedGroup.slice(1).map(toItem => {
          const to = path.resolve(path.dirname(toItem.path))

          console.log('========================================');
          console.log('[S] from:', from, 'to:', to)
          console.log('[V] from:', fromItem.v, 'to:', toItem.v)
          
          const dedupeTo = path.join(target_path, 'A_DEDUPE_FOLDER', toItem.name + toItem.v);

          try {
            fs.removeSync(to)
            fs.createSymlinkSync(from, to, 'dir')
          } catch (e) {
            console.log('[E]', e.message)
          }
        });
      })
  })
}
