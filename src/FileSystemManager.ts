import { readdir, stat } from 'fs/promises';
import { watch } from 'fs';
import path from 'path';

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  lastModified: Date;
}

export class FileSystemManager {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async listContents(subPath: string = ''): Promise<FileInfo[]> {
    const targetPath = path.join(this.basePath, subPath);
    const entries = await readdir(targetPath);

    const contents = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(targetPath, entry);
        const stats = await stat(fullPath);

        return {
          name: entry,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          lastModified: stats.mtime,
        };
      })
    );

    return contents;
  }

  watchDirectory(callback: (eventType: string, filename: string) => void): void {
    watch(this.basePath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        callback(eventType, filename);
      }
    });
  }

  getAbsolutePath(relativePath: string): string {
    return path.join(this.basePath, relativePath);
  }
}
