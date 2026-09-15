import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import formidable from 'formidable';
import { requireUser } from '../../../lib/apiSession';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
]);
const EXTENSION_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
};
const MAX_FILE_SIZE = 40 * 1024 * 1024;

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const form = formidable({
    maxFiles: 1,
    maxFileSize: MAX_FILE_SIZE,
    filter: (part) => Boolean(part.mimetype && ALLOWED_TYPES.has(part.mimetype)),
  });

  let files;
  try {
    [, files] = await form.parse(req);
  } catch (error) {
    return res.status(400).json({ error: 'Upload failed. Make sure the file is an image or video under 40MB.' });
  }

  const file = files.file?.[0];
  if (!file) {
    return res.status(400).json({ error: 'No valid image or video file was provided.' });
  }

  const extension = EXTENSION_BY_TYPE[file.mimetype] || path.extname(file.originalFilename || '') || '';
  const filename = `${crypto.randomUUID()}${extension}`;
  const destination = path.join(UPLOAD_DIR, filename);

  fs.copyFileSync(file.filepath, destination);
  fs.unlinkSync(file.filepath);

  return res.status(201).json({ url: `/uploads/${filename}` });
}
