import { Pipe, PipeTransform } from '@angular/core';
import { resolveAssetUrl } from '../utils/asset-url.util';

@Pipe({
  name: 'assetUrl',
  standalone: true
})
export class AssetUrlPipe implements PipeTransform {
  transform(value?: string | null): string {
    return resolveAssetUrl(value);
  }
}
