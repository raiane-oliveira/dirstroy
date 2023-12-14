#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { Command } from 'commander'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const program = new Command()

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
  .option('-f --force', 'Behavior similar to the `rm -rf` Unix command.', false)
  .parse()

const { force, ...options } = program.opts()

const dirNameWillBeDeleted = options.name
const dirNameWillBeDeletedRegex = new RegExp(
  `\\b${dirNameWillBeDeleted}\\b`,
  'gm',
)
const rootPathStartDeletions = options.path

// Delete first occurrence of dirname input
if (!options.recursive) {
  const dirPath = path.join(rootPathStartDeletions, dirNameWillBeDeleted)
  await deleteDir(dirPath, { force })
}

let totalDirsDeleted = 0
const dir = await fs.readdir(rootPathStartDeletions, { recursive: true })

for await (const dirent of dir) {
  const dirPath = path.join(rootPathStartDeletions, dirent)

  if (dirPath.match(dirNameWillBeDeletedRegex)) {
    await deleteDir(dirPath, { force })
    totalDirsDeleted += 1
  }
}

console.log(`\nTotal deleted directories: ${totalDirsDeleted}`)
process.exit(0)

async function deleteDir(dirPath, options) {
  try {
    process.stdout.write(`Deleting ${dirPath}...`)
    await fs.rm(dirPath, { recursive: true, ...options })
    process.stdout.write(`✅\n`)
  } catch (err) {
    console.log(
      `❌\n\n❗ An error occurred while deleting the '${dirNameWillBeDeleted}' folder in '${rootPathStartDeletions}' path.\n`,
    )
    console.error('> ⚠️ More details: \n', err)
    process.exit(1)
  }
}
