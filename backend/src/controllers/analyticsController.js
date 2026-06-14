const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

class AnalyticsController {
  /**
   * Get overall user dashboard analytics
   */
  async dashboard(req, res, next) {
    try {
      const userId = req.user.userId;
      const summary = await analyticsService.getUserDashboardSummary(userId);
      return sendSuccess(res, 200, 'Dashboard summary stats retrieved', summary);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get individual URL detailed click logs and charts
   */
  async urlDetail(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const details = await analyticsService.getUrlAnalytics(id, userId, { page, limit });
      return sendSuccess(res, 200, 'URL analytics retrieved', details);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get public stats by shortCode
   */
  async publicStats(req, res, next) {
    try {
      const { shortCode } = req.params;
      const stats = await analyticsService.getPublicStats(shortCode);
      return sendSuccess(res, 200, 'Public URL statistics retrieved', stats);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
