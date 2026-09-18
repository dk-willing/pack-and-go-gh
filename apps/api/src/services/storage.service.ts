export interface StoredAttachment {
  name: string;
  storageKey: string;
  contentType: string;
  size: number;
}

/** Storage provider boundary. Connect S3, Cloudinary, or another provider here before accepting uploads. */
export interface FileStorage {
  put(file: Buffer, key: string, contentType: string): Promise<StoredAttachment>;
  remove(key: string): Promise<void>;
}