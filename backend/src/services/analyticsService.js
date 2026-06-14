const Visit = require('../models/Visit');
const Url = require('../models/Url');
const { parseUserAgent, parseReferrer } = require('../utils/uaParser');
const { getIpGeo } = require('../utils/geo');

class AnalyticsService {
  /**
   * Record a redirect visit log asynchronously.
   */
  async recordVisit({ url, ip, userAgent, referrerHeader }) {
    try {
      const { browser, os, device } = parseUserAgent(userAgent);
      const referrer = parseReferrer(referrerHeader);
      const { country, city } = getIpGeo(ip);

      // Create visit log
      await Visit.create({
        urlId: url._id,
        browser,
        device,
        os,
        referrer,
        country,
        city
      });

      // Increment click count in Url document atomically
      await Url.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });
    } catch (err) {
      console.error('Failed to log visit analytics:', err.message);
    }
  }

  /**
   * Get overall dashboard analytics summary for a user.
   */
  async getUserDashboardSummary(userId) {
    // Fetch all active urls for this user
    const userUrls = await Url.find({ userId, deletedAt: null });
    const urlIds = userUrls.map(u => u._id);

    const totalLinks = userUrls.length;
    const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);
    const activeLinks = userUrls.filter(url => url.status === 'active').length;

    // Start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const clicksToday = await Visit.countDocuments({
      urlId: { $in: urlIds },
      timestamp: { $gte: startOfToday }
    });

    // Chart click data over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const visitAggregation = await Visit.aggregate([
      {
        $match: {
          urlId: { $in: urlIds },
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build complete daily series (zero-filled for empty days)
    const dailyClicks = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = visitAggregation.find(v => v._id === dateStr);
      dailyClicks.push({
        date: dateStr,
        clicks: match ? match.clicks : 0
      });
    }

    const [topLinks, browserStats, deviceStats] = await Promise.all([
      Url.find({ userId, deletedAt: null })
        .sort({ clicks: -1 })
        .limit(5)
        .select('longUrl shortCode clicks createdAt'),
      Visit.aggregate([
        { $match: { urlId: { $in: urlIds } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Visit.aggregate([
        { $match: { urlId: { $in: urlIds } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      cards: {
        totalLinks,
        totalClicks,
        activeLinks,
        clicksToday
      },
      dailyClicks,
      topLinks,
      browserStats: browserStats.map(item => ({ name: item._id, value: item.count })),
      deviceStats: deviceStats.map(item => ({ name: item._id, value: item.count }))
    };
  }

  /**
   * Get detailed analytics for a single URL.
   */
  async getUrlAnalytics(urlId, userId, { page = 1, limit = 10 }) {
    // Verify ownership
    const url = await Url.findOne({ _id: urlId, userId, deletedAt: null });
    if (!url) {
      const error = new Error('URL not found');
      error.statusCode = 404;
      throw error;
    }

    // Last visited visit log
    const lastVisitLog = await Visit.findOne({ urlId }).sort({ timestamp: -1 });
    const lastVisitedTime = lastVisitLog ? lastVisitLog.timestamp : null;

    // Aggregate Daily clicks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const clickAggregation = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = clickAggregation.find(c => c._id === dateStr);
      dailyClicks.push({
        date: dateStr,
        clicks: match ? match.clicks : 0
      });
    }

    // Parallelize all remaining aggregations
    const [
      deviceStats,
      browserStats,
      osStats,
      referrerStats,
      countryStats,
      cityStats
    ] = await Promise.all([
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ])
    ]);

    // Recent visits paginated
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const visits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const totalVisits = await Visit.countDocuments({ urlId: url._id });

    return {
      url,
      summary: {
        totalClicks: url.clicks,
        lastVisitedTime
      },
      charts: {
        dailyClicks,
        deviceStats: deviceStats.map(item => ({ name: item._id, value: item.count })),
        browserStats: browserStats.map(item => ({ name: item._id, value: item.count })),
        osStats: osStats.map(item => ({ name: item._id, value: item.count })),
        referrerStats: referrerStats.map(item => ({ name: item._id, value: item.count })),
        countryStats: countryStats.map(item => ({ name: item._id, value: item.count })),
        cityStats: cityStats.map(item => ({ name: item._id, value: item.count }))
      },
      visitsTable: {
        visits,
        totalVisits,
        totalPages: Math.ceil(totalVisits / parsedLimit),
        currentPage: parseInt(page)
      }
    };
  }

  /**
   * Get public stats for public views.
   */
  async getPublicStats(shortCode) {
    const url = await Url.findOne({ shortCode, deletedAt: null });
    if (!url) {
      const error = new Error('URL not found or has been deleted');
      error.statusCode = 404;
      throw error;
    }

    return {
      clicks: url.clicks,
      createdAt: url.createdAt,
      status: url.status,
      expiresAt: url.expiresAt
    };
  }
}

module.exports = new AnalyticsService();
