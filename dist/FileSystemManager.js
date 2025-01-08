"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemManager = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileSystemManager {
    constructor(basePath) {
        this.basePath = path_1.default.resolve(basePath);
    }
    listContents() {
        return __awaiter(this, arguments, void 0, function* (subPath = '') {
            const targetPath = path_1.default.join(this.basePath, subPath);
            const entries = yield (0, promises_1.readdir)(targetPath);
            const contents = yield Promise.all(entries.map((entry) => __awaiter(this, void 0, void 0, function* () {
                const fullPath = path_1.default.join(targetPath, entry);
                const stats = yield (0, promises_1.stat)(fullPath);
                return {
                    name: entry,
                    path: fullPath,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    lastModified: stats.mtime,
                };
            })));
            return contents;
        });
    }
    watchDirectory(callback) {
        (0, fs_1.watch)(this.basePath, { recursive: true }, (eventType, filename) => {
            if (filename) {
                callback(eventType, filename);
            }
        });
    }
    getAbsolutePath(relativePath) {
        return path_1.default.join(this.basePath, relativePath);
    }
}
exports.FileSystemManager = FileSystemManager;
