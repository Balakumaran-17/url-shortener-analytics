const User = require('../models/User');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

class AdminService {
  async getSystemStats() {
    const totalUsers = await User.countDocuments();
    const totalUrls = await Url.countDocuments();
    const totalVisits = await Visit.countDocuments();

    return {
      totalUsers,
      totalUrls,
      totalVisits
    };
  }

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await User.countDocuments();
    return {
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page)
    };
  }

  async getAllUrls(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const urls = await Url.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Url.countDocuments();
    return {
      urls,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page)
    };
  }

  async deleteUrl(urlId) {
    const url = await Url.findById(urlId);
    if (!url) {
      throw new Error('URL not found');
    }
    url.deletedAt = new Date();
    url.status = 'inactive';
    await url.save();
    return url;
  }
}

module.exports = new AdminService();
