import { isNative } from './platform.service';

export interface ExportOptions {
  filename: string;
  content: string;
  mimeType: string;
}

export interface ExportResult {
  success: boolean;
  method: 'native' | 'download' | 'none';
  message?: string;
}

export async function exportFile(options: ExportOptions): Promise<ExportResult> {
  if (isNative) {
    try {
      const { Filesystem, Directory, FilesystemEncoding } = await import('@capacitor/filesystem');
      const path = options.filename.replace(/\.\w+$/, '');
      const ext = options.filename.split('.').pop() ?? 'txt';
      const result = await Filesystem.writeFile({
        path: `${path}.${ext}`,
        data: options.content,
        directory: Directory.Documents,
        encoding: FilesystemEncoding.UTF8,
      });
      return { success: true, method: 'native', message: result.uri };
    } catch {
      // fall through to web download
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const blob = new Blob([options.content], { type: options.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { success: true, method: 'download' };
    } catch {
      // download failed
    }
  }

  return { success: false, method: 'none', message: 'Export not available' };
}
