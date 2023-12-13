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

if (!options.recursive) {
  const dirPath = path.join(rootPathStartDeletions, dirNameWillBeDeleted)
  try {
    process.stdout.write(`Deleting ${dirPath}...`)
    await fs.rm(dirPath, { recursive: true, force })
    process.stdout.write(`✅\n`)

    process.exit(0)
  } catch (err) {
    console.log(
      `❌ Ocorreu um erro ao deletar a pasta ${dirNameWillBeDeleted} de ${rootPathStartDeletions}.\n`,
    )
    console.error('❗ Mais detalhes: \n', err)
    process.exit(1)
  }
}

let totalDirsDeleted = 0

try {
  const dir = await fs.readdir(rootPathStartDeletions, { recursive: true })

  for await (const dirent of dir) {
    const dirPath = path.join(rootPathStartDeletions, dirent)

    if (dirPath.includes(dirNameWillBeDeleted)) {
      process.stdout.write(`Deleting ${dirPath}...`)

      await fs.rm(dirPath, { recursive: true, force })
      process.stdout.write(`✅\n`)
      totalDirsDeleted += 1
    }
  }
} catch (err) {
  console.log(
    `❌ Ocorreu um erro ao deletar as pastas ${dirNameWillBeDeleted} de ${rootPathStartDeletions}.\n`,
  )
  console.error('❗ Mais detalhes: \n', err)
  process.exit(1)
}

console.log(`\nTotal amount of deleted directories: ${totalDirsDeleted}`)
process.exit(0)
