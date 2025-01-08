#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolders = createFolders;
const FileSystemManager_1 = require("./FileSystemManager");
const testOpenAI_1 = require("./testOpenAI");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const cli_1 = require("./cli");
const YOUR_API_KEY = process.env.OPENAI_API_KEY || '';
// Function to create folders
function createFolders(basePath, folderName) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = path.join(basePath, folderName);
        console.log(`Creating folder: ${folderPath}`);
        try {
            yield fs.mkdir(folderPath, { recursive: true });
            console.log(`Folder created: ${folderPath}`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error creating folder: ${error.message}`);
            }
            else {
                console.error('An unknown error occurred');
            }
        }
    });
}
// Function to move files
function moveFilesToFolder(folderPath, basePath, files) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const file of files) {
            const filePath = path.join(basePath, file.name);
            const newFilePath = path.join(folderPath, file.name);
            try {
                yield fs.rename(filePath, newFilePath);
                console.log(`Moved file: ${filePath} → ${newFilePath}`);
            }
            catch (moveError) {
                console.error(`Error moving file ${filePath}:`, moveError);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the local address from the user
        const basePath = yield (0, cli_1.askForAddress)();
        const fsManager = new FileSystemManager_1.FileSystemManager(basePath);
        const openAI = new testOpenAI_1.OpenAIClient(YOUR_API_KEY);
        try {
            const contents = yield fsManager.listContents();
            const prompt = `
      Here are the files in my directory: ${JSON.stringify(contents, null, 2)}.
      Please suggest how I can organize these files. A 'folders' array where each folder is represented as an object. Each folder object should have A name property for the folder's name, and a files array, where each file is an object with the file name as the value of a name property. Do not include any additional information, comments, or explanation. Only output the JSON structure.`;
            const response = yield openAI.sendMessage(prompt);
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
                    yield createFolders(basePath, folderName);
                    // Move files to the created folder
                    yield moveFilesToFolder(folderPath, basePath, files);
                }
            }
            catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.error('Cleaned GPT Response:', rawContent);
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
main();
