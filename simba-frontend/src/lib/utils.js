import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const MINIMUM_ORDER_AMOUNT = 2500;
export const FREE_DELIVERY_THRESHOLD = 60000;

export function formatRwf(amount) {
  return `RWF ${Number(amount || 0).toLocaleString()}`;
}

export function shortName(name = '') {
  return name.replace(/^Simba Supermarket\s*/i, '').replace(/^Simba\s*/i, '') || name;
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest branch to the user's location
 * @param {Array} branches - Array of branch objects with lat/lng properties
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {Object|null} - The closest branch object or null if no branches
 */
export function findClosestBranch(branches, userLat, userLng) {
  if (!branches || branches.length === 0 || !userLat || !userLng) {
    return null;
  }
  
  let closestBranch = null;
  let minDistance = Infinity;
  
  branches.forEach(branch => {
    const distance = calculateDistance(userLat, userLng, branch.lat, branch.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestBranch = { ...branch, distance };
    }
  });
  
  return closestBranch;
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

export function fallbackToOriginalImage(event, originalUrl) {
  const img = event.currentTarget;

  if (originalUrl && img.dataset.fallbackApplied !== 'true' && img.src !== originalUrl) {
    img.dataset.fallbackApplied = 'true';
    img.src = originalUrl;
    return;
  }

  img.src = 'https://via.placeholder.com/600?text=Product+Image';
}
