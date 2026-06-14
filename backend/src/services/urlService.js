const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { generateQRCode } = require('../utils/qr');

class UrlService {
  /**
   * Validate long URL health, structure, protocol, and prevent internal loops.
   */
  validateLongUrl(urlStr) {
    if (!urlStr) {
      throw new Error('Destination URL is required');
    }

    try {
      const parsedUrl = new URL(urlStr);
      
      // Allow only http: and https: protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol. Only HTTP and HTTPS destination URLs are allowed.');
      }

      const hostname = parsedUrl.hostname.toLowerCase();

      // Prevent localhost and common loopback IPs
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === '0.0.0.0'
      ) {
        throw new Error('Loopback / localhost destination URLs are not allowed.');
      }

      // Prevent internal subnet IPs (10.x, 192.168.x, 172.16.x to 172.31.x)
      const ipRegex = /^(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))\./;
      if (ipRegex.test(hostname)) {
        throw new Error('Internal network destination URLs are not allowed.');
      }

      return true;
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Invalid URL format. Make sure to include http:// or https://');
      }
      throw err;
    }
  }

  /**
   * Create a shortened URL
   */
  async createUrl({ longUrl, customAlias, expiresAt, userId, hostBaseUrl }) {
    // Validate target URL
    this.validateLongUrl(longUrl);

    let shortCode = '';

    // If custom alias is provided, check uniqueness and format
    if (customAlias) {
      // Validate format: alphanumeric and hyphen/underscore only
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(customAlias)) {
        const error = new Error('Custom alias must be alphanumeric, hyphens, or underscores only');
        error.statusCode = 400;
        throw error;
      }

      // Check collision in DB (both active and soft-deleted/expired aliases should block reuse)
      const existingAlias = await Url.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }]
      });
      if (existingAlias) {
        const error = new Error('Custom alias is already in use');
        error.statusCode = 400;
        throw error;
      }
      shortCode = customAlias;
    } else {
      // Generate unique shortCode with collision retries
      let attempts = 0;
      let unique = false;
      while (!unique && attempts < 5) {
        shortCode = nanoid(7); // Premium short size (7 characters)
        const collision = await Url.findOne({ shortCode });
        if (!collision) {
          unique = true;
        }
        attempts++;
      }
      if (!unique) {
        const error = new Error('Failed to generate a unique short code. Please try again.');
        error.statusCode = 500;
        throw error;
      }
    }

    // Generate dynamic QR Code pointing to redirect link
    const redirectUrl = `${hostBaseUrl}/${shortCode}`;
    const qrCode = await generateQRCode(redirectUrl);

    // Save URL
    const url = await Url.create({
      userId,
      longUrl,
      shortCode,
      customAlias: customAlias || null,
      qrCode,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    return url;
  }

  /**
   * Retrieve active URLs list for a user (with search, filter, pagination, sorting)
   */
  async getUrlsForUser(userId, { search = '', sort = '-createdAt', page = 1, limit = 10, status }) {
    const query = {
      userId,
      deletedAt: null // Only active/not soft-deleted URLs
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search query on customAlias, shortCode, longUrl
    if (search) {
      const sanitizedSearch = search.toString().substring(0, 100);
      const escapedSearch = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { longUrl: { $regex: escapedSearch, $options: 'i' } },
        { shortCode: { $regex: escapedSearch, $options: 'i' } },
        { customAlias: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    // Handle pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    // Find items
    const urls = await Url.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    // Count totals
    const totalCount = await Url.countDocuments(query);

    return {
      urls,
      totalCount,
      totalPages: Math.ceil(totalCount / parsedLimit),
      currentPage: parseInt(page)
    };
  }

  /**
   * Get single URL by id
   */
  async getUrlById(id, userId) {
    const url = await Url.findOne({ _id: id, userId, deletedAt: null });
    if (!url) {
      const error = new Error('URL not found or has been deleted');
      error.statusCode = 404;
      throw error;
    }
    return url;
  }

  /**
   * Edit URL destination
   */
  async updateUrl(id, userId, { longUrl, expiresAt }) {
    const url = await this.getUrlById(id, userId);

    if (longUrl) {
      this.validateLongUrl(longUrl);
      url.longUrl = longUrl;
    }

    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    // Recheck status
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      url.status = 'expired';
    } else {
      url.status = 'active';
    }

    await url.save();
    return url;
  }

  /**
   * Soft-delete URL
   */
  async deleteUrl(id, userId) {
    const url = await this.getUrlById(id, userId);
    url.deletedAt = new Date();
    url.status = 'inactive';
    await url.save();
    return true;
  }

  /**
   * Find URL by shortCode (used during redirects)
   */
  async findUrlByCode(shortCode) {
    const url = await Url.findOne({ shortCode, deletedAt: null });
    if (!url) {
      return null;
    }

    // Check expiry
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      if (url.status !== 'expired') {
        url.status = 'expired';
        await url.save();
      }
      return { url, isExpired: true };
    }

    return { url, isExpired: false };
  }
}

module.exports = new UrlService();
