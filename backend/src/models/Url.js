const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    longUrl: {
      type: String,
      required: [true, 'Destination URL is required'],
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true
    },
    clicks: {
      type: Number,
      default: 0
    },
    qrCode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for performance sorting and filtering of active urls per user
UrlSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

module.exports = mongoose.model('Url', UrlSchema);
