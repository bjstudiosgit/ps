import 'server-only';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeCode } from '@/lib/batch-validation';

const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

/** Match the batch number to a photo; missing photos never block verification. */
export async function findProductImage(code: string): Promise<string | null> {
  const basename = normalizeCode(code).toLowerCase();
  const directory = path.join(process.cwd(), 'public', 'products');
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const filenames = entries.filter(entry => entry.isFile()).map(entry => entry.name).sort();
    const filename = extensions
      .map(extension => filenames.find(name => name.toLowerCase() === basename + extension))
      .find(Boolean);
    if (!filename) return null;
    const content = await readFile(path.join(directory, filename));
    // Replacing a photo changes its URL, including Next's optimized image cache.
    const version = createHash('sha256').update(content).digest('hex').slice(0, 16);
    return '/products/' + encodeURIComponent(filename) + '?v=' + version;
  } catch {
    return null;
  }
}
