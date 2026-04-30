import logger from 'kolibri-logging';
import { PICTURE_PASSWORD_SET } from 'kolibri/constants';
import { PicturePasswordIconStyle } from '../constants/Auth';

const logging = logger.getLogger(__filename);

/**
 * Resolves a `picture_password` string into an ordered array of icon descriptor objects.
 *
 * @param {string|null} picturePassword - Dot-separated string of icon IDs, e.g. "3.7.12"
 * @param {string|null} [iconStyle] - Optional display style: "colorful" or "standard"
 * @returns {Array<{label: string, iconName: string, iconColorful?: string, iconStandard?: string}>}
 */
export function getPicturePasswordIcons(picturePassword, iconStyle = null) {
  if (!picturePassword) {
    return [];
  }
  return picturePassword
    .split('.')
    .map(segment => {
      const key = String(Number(segment));
      const entry = PICTURE_PASSWORD_SET[key];
      if (!entry) {
        logging.warn(`Unknown picture password icon key: "${segment}"`);
        return null;
      }
      const result = { label: entry.name };
      if (iconStyle === PicturePasswordIconStyle.COLORFUL) {
        result.iconName = result.iconColorful = entry.iconColorful;
      } else {
        // Covers PicturePasswordIconStyle.STANDARD and any unrecognised/null value
        result.iconName = result.iconStandard = entry.iconStandard;
      }
      return result;
    })
    .filter(Boolean);
}
