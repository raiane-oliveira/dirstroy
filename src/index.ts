#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { Command, OptionValues } from '@commander-js/extra-typings'

interface Options extends OptionValues {
  name: string
  path: string
  recursive: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const program = new Command<any[], Options>()

program
  .usage('Usage: -n <name> -p <path>')
  .requiredOption('-n, --name <value>', 'Directory name you want to delete')
  .requiredOption(
    '-p --path <value>',
    'Directory path where you want to delete the occurrences of your folder.',
  )
  .option(
    '-r --recursive',
    'Determines if it will delete all occurrences of your folder or not.',
    false,
  )
  .parse()

const options = program.opts()

const dirNameWillBeDeleted = options.name
const rootPathStartDeletions = options.path

if (!options.recursive) {
  const dirPath = path.join(rootPathStartDeletions, dirNameWillBeDeleted)
  try {
    process.stdout.write(`Deleting ${dirPath}...`)
    fs.rmdirSync(dirPath)
    process.stdout.write(`✅\n`)
  } catch {
    console.log(`❌ The directory '${dirNameWillBeDeleted}' doesn't exists.`)
    process.exit(1)
  }
  process.exit(0)
}

fs.readdirSync(rootPathStartDeletions, {
  recursive: true,
}).forEach((fileName) => {
  const dirPath = path.join(rootPathStartDeletions, fileName.toString())

  if (dirPath.includes(dirNameWillBeDeleted)) {
    process.stdout.write(`Deleting ${dirPath}...`)

    fs.rm(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
    process.stdout.write(`✅\n`)
  }
})
