import fs from 'fs';
import path from 'path';

export interface IMediaStorageService {
  upload(file: Express.Multer.File, destinationFolder: string): Promise<string>;
  delete(url: string): Promise<void>;
  getUrl(path: string): string;
}

export class LocalFileStorageService implements IMediaStorageService {
  private baseStoragePath: string;
  private baseUrl: string;

  constructor() {
    this.baseStoragePath = process.env.MEDIA_STORAGE_PATH || './uploads';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:4000/uploads';
    
    if (!fs.existsSync(this.baseStoragePath)) {
      fs.mkdirSync(this.baseStoragePath, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, destinationFolder: string): Promise<string> {
    const folderPath = path.join(this.baseStoragePath, destinationFolder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    const filePath = path.join(folderPath, fileName);
    
    await fs.promises.writeFile(filePath, file.buffer);

    return `${this.baseUrl}/${destinationFolder}/${fileName}`;
  }

  async delete(url: string): Promise<void> {
    if (url.startsWith(this.baseUrl)) {
      const relativePath = url.slice(this.baseUrl.length);
      const filePath = path.join(this.baseStoragePath, relativePath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }

  getUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`;
  }
}

export const mediaStorageService = new LocalFileStorageService();
