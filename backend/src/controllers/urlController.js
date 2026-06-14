const urlService = require('../services/urlService');
const { sendSuccess } = require('../utils/response');

class UrlController {
  /**
   * Create a shortened link
   */
  async create(req, res, next) {
    try {
      const { longUrl, customAlias, expiresAt } = req.body;
      const userId = req.user.userId;

      // Construct server base redirect URL
      const hostBaseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;

      const url = await urlService.createUrl({
        longUrl,
        customAlias,
        expiresAt,
        userId,
        hostBaseUrl
      });

      return sendSuccess(res, 201, 'URL shortened successfully', { url });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List all URLs for a user
   */
  async list(req, res, next) {
    try {
      const userId = req.user.userId;
      const { search, sort, page, limit, status } = req.query;

      const result = await urlService.getUrlsForUser(userId, {
        search,
        sort,
        page,
        limit,
        status
      });

      return sendSuccess(res, 200, 'URLs retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get individual URL details
   */
  async get(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const url = await urlService.getUrlById(id, userId);
      return sendSuccess(res, 200, 'URL details retrieved', { url });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Edit URL destination
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { longUrl, expiresAt } = req.body;

      const url = await urlService.updateUrl(id, userId, { longUrl, expiresAt });
      return sendSuccess(res, 200, 'URL updated successfully', { url });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete URL (Soft-delete)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await urlService.deleteUrl(id, userId);
      return sendSuccess(res, 200, 'URL deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UrlController();
