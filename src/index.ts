#!/usr/bin/env node

import { FileSystemManager } from './FileSystemManager';
import { OpenAIClient } from './testOpenAI';
import * as fs from 'fs/promises';
import * as path from 'path';
import { askForAddress } from './cli';

const YOUR_API_KEY = process.env.OPENAI_API_KEY || '';

// Function to create folders
export async function createFolders(basePath: string, folderName: string) {
  const folderPath = path.join(basePath, folderName);
  console.log(`Creating folder: ${folderPath}`);

  try {
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`Folder created: ${folderPath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error creating folder: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
  }
}

// Function to move files
async function moveFilesToFolder(folderPath: string, basePath: string, files: any[]) {
  for (const file of files) {
    const filePath = path.join(basePath, file.name);
    const newFilePath = path.join(folderPath, file.name);

    try {
      await fs.rename(filePath, newFilePath);
      console.log(`Moved file: ${filePath} → ${newFilePath}`);
    } catch (moveError) {
      console.error(`Error moving file ${filePath}:`, moveError);
    }
  }
}

async function main() {
  // Get the local address from the user
  const basePath = await askForAddress();

  const fsManager = new FileSystemManager(basePath);
  const openAI = new OpenAIClient(YOUR_API_KEY);

  try {
    const contents = await fsManager.listContents();

    const prompt = `
      Here are the files in my directory: ${JSON.stringify(contents, null, 2)}.
      Please suggest how I can organize these files. A 'folders' array where each folder is represented as an object. Each folder object should have A name property for the folder's name, and a files array, where each file is an object with the file name as the value of a name property. Do not include any additional information, comments, or explanation. Only output the JSON structure.`;

    const response = await openAI.sendMessage(prompt);

    let rawContent = response.choices[0].message.content.trim();

    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/```(?:json)?|```/g, '').trim();
    }

    let parsedFolderStructure;
    try {
      parsedFolderStructure = JSON.parse(rawContent);
      const exampleProjectFolder = parsedFolderStructure['folders'];

      for (const folder of exampleProjectFolder) {
        const folderName = folder.name;
        const folderPath = path.join(basePath, folderName);
        const files = folder.files;

        // Create folder
        await createFolders(basePath, folderName);

        // Move files to the created folder
        await moveFilesToFolder(folderPath, basePath, files);
      }

    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Cleaned GPT Response:', rawContent);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
