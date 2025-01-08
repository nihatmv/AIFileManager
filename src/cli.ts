#!/usr/bin/env node

import inquirer from 'inquirer';

// Display project name
console.log('Welcome to the Folderize CLI Tool!');

// Ask for the local address
export async function askForAddress(): Promise<string> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'address',
      message: 'Please provide the local address to make changes:',
    },
  ]);

  console.log(`You provided the address: ${answers.address}`);
  return answers.address;
}
