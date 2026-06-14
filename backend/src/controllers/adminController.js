const adminService = require('../services/adminService');
const Response = require('../utils/response');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getSystemStats();
    res.status(200).json(Response.success('System stats retrieved', stats));
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAllUsers(page, limit);
    res.status(200).json(Response.success('Users retrieved', result));
  } catch (error) {
    next(error);
  }
};

exports.getUrls = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAllUrls(page, limit);
    res.status(200).json(Response.success('URLs retrieved', result));
  } catch (error) {
    next(error);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    await adminService.deleteUrl(req.params.id);
    res.status(200).json(Response.success('URL deleted successfully'));
  } catch (error) {
    if (error.message === 'URL not found') {
      return res.status(404).json(Response.error('URL not found', { code: 'NOT_FOUND' }));
    }
    next(error);
  }
};
