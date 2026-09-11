import { environment } from 'src/environments/environment';

export function resolveAssetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiUrl = environment.apiUrl || '';
  const base = apiUrl.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
