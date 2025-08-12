// Backend categories configuration for validation and consistency
const categories = [
  { id: "cat1", name: "Books & Education", description: "Educational materials, textbooks, and learning resources" },
  { id: "cat2", name: "School Meals", description: "Nutrition programs and meal services for students" },
  { id: "cat3", name: "Sanitation", description: "Hygiene facilities, clean water, and sanitation infrastructure" },
  { id: "cat4", name: "Sports Equipment", description: "Sports gear, equipment, and athletic facilities" },
  { id: "cat5", name: "Technology", description: "Computers, tablets, and educational technology" },
  { id: "cat6", name: "Infrastructure", description: "Building repairs, classroom furniture, and school facilities" },
];

// Map category IDs to display names for easy lookup
const categoryMap = {
  "cat1": "Books & Education",
  "cat2": "School Meals", 
  "cat3": "Sanitation",
  "cat4": "Sports Equipment",
  "cat5": "Technology",
  "cat6": "Infrastructure",
};

// Get category display name from ID
const getCategoryDisplayName = (categoryID) => {
  return categoryMap[categoryID] || categoryID || 'Unknown';
};

// Get category object by ID
const getCategoryById = (categoryID) => {
  return categories.find(cat => cat.id === categoryID) || null;
};

// Get category object by name
const getCategoryByName = (categoryName) => {
  return categories.find(cat => cat.name === categoryName) || null;
};

// Validate if a category ID is valid
const isValidCategoryId = (categoryID) => {
  return Object.keys(categoryMap).includes(categoryID);
};

// Get all valid category IDs
const getValidCategoryIds = () => {
  return Object.keys(categoryMap);
};

module.exports = {
  categories,
  categoryMap,
  getCategoryDisplayName,
  getCategoryById,
  getCategoryByName,
  isValidCategoryId,
  getValidCategoryIds
}; 