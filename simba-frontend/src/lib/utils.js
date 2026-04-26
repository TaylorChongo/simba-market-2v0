import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Optimizes a Cloudinary URL by adding transformation parameters.
 * @param {string} url - The original Cloudinary image URL.
 * @param {object} options - Optimization options.
 * @param {number} options.width - The desired width of the image.
 * @param {number} options.height - The desired height of the image.
 * @param {string} options.crop - The crop mode (default: 'fill').
 * @returns {string} - The optimized URL.
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;

  const { width, height, crop = 'fill' } = options;
  
  // Base transformations for quality and format
  let transformations = 'f_auto,q_auto';
  
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (width || height) transformations += `,c_${crop}`;

  // Insert transformations after '/upload/'
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const preUpload = url.substring(0, uploadIndex + 8);
  const postUpload = url.substring(uploadIndex + 8);

  // Avoid double transformations if already present
  if (postUpload.startsWith('f_auto') || postUpload.match(/^[a-z]_[a-z0-9]+/)) {
    return url;
  }

  return `${preUpload}${transformations}/${postUpload}`;
}
