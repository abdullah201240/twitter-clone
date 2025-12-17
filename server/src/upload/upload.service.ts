import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  filename: string;
  path: string;
  url: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getMulterOptions() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, this.uploadDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!this.allowedMimes.includes(file.mimetype)) {
          return cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  deleteFile(filename: string): void {
    if (!filename) return;

    try {
      const filepath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  extractFilenameFromUrl(url: string): string | null {
    if (!url) return null;
    const match = url.match(/\/uploads\/([^/]+)$/);
    return match ? match[1] : null;
  }
}
