const mongoose = require('mongoose');

const sectionContentSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'video', 'image', 'document'],
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SectionContent', sectionContentSchema);