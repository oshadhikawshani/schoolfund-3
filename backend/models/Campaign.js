const mongoose = require('mongoose');
const { isValidCategoryId } = require('../config/categories');

const campaignSchema = new mongoose.Schema({
  campaignID: { type: String, required: true, unique: true },
  campaignName: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  image: { type: String },
  schoolID: { type: String, required: true },
  categoryID: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return isValidCategoryId(v);
      },
      message: props => `${props.value} is not a valid category ID`
    }
  },
  monetaryType: { type: String, enum: ['Monetary', 'Non-Monetary'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'principal_pending', 'rejected'], default: 'pending' },
  deadline: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema, 'campaigns'); 