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
const rootPathStartDeletions = options.path

// Delete first occurrence of dirname input
if (!options.recursive) {
  const dirPath = path.join(rootPathStartDeletions, dirNameWillBeDeleted)
  await deleteDir(dirPath, { force })
  process.exit(0)
}

let totalDirsDeleted = 0

for await (const dirent of openDirGen(rootPathStartDeletions)) {
  const dirPathSplitted = path.join(dirent.parentPath, dirent.name).split('/')
  const dirPathIndex = dirPathSplitted.findIndex(
    (item) => item === dirNameWillBeDeleted,
  )
  const dirPath = dirPathSplitted.slice(0, dirPathIndex + 1).join('/')
  if (
    dirent.name === dirNameWillBeDeleted &&
    dirPath === path.join(dirent.parentPath, dirNameWillBeDeleted)
  ) {
    await deleteDir(dirPath, { force })
    totalDirsDeleted += 1
  }
}

console.log(`\nTotal deleted directories: ${totalDirsDeleted}`)
process.exit(0)

async function* openDirGen(directory) {
  try {
    const dir = await fs.opendir(directory, { recursive: true })

    for await (const dirent of dir) {
      yield dirent
    }
  } catch (err) {
    console.log(`\n\n❗An error occurred while deleting the '${err.path}'.\n`)
  }
}

async function deleteDir(dirPath, options) {
  try {
    process.stdout.write(`Deleting ${dirPath}...`)
    await fs.rm(dirPath, { recursive: true, ...options })
    process.stdout.write(`✅\n`)
  } catch (err) {
    console.log(
      `❌\n\n❗ An error occurred while deleting the '${dirNameWillBeDeleted}' folder in '${rootPathStartDeletions}' path.\n`,
    )
    console.error('> ! More details: \n', err)
    process.exit(1)
  }
}
