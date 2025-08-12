// Centralized categories configuration for the SchoolFund application
export const categories = [
  { id: "cat1", name: "Books & Education", description: "Educational materials, textbooks, and learning resources" },
  { id: "cat2", name: "School Meals", description: "Nutrition programs and meal services for students" },
  { id: "cat3", name: "Sanitation", description: "Hygiene facilities, clean water, and sanitation infrastructure" },
  { id: "cat4", name: "Sports Equipment", description: "Sports gear, equipment, and athletic facilities" },
  { id: "cat5", name: "Technology", description: "Computers, tablets, and educational technology" },
  { id: "cat6", name: "Infrastructure", description: "Building repairs, classroom furniture, and school facilities" },
];

// Map category IDs to display names for easy lookup
export const categoryMap = {
  "cat1": "Books & Education",
  "cat2": "School Meals", 
  "cat3": "Sanitation",
  "cat4": "Sports Equipment",
  "cat5": "Technology",
  "cat6": "Infrastructure",
};

// Get category display name from ID
export const getCategoryDisplayName = (categoryID) => {
  return categoryMap[categoryID] || categoryID || 'Unknown';
};

// Get category object by ID
export const getCategoryById = (categoryID) => {
  return categories.find(cat => cat.id === categoryID) || null;
};

// Get category object by name
export const getCategoryByName = (categoryName) => {
  return categories.find(cat => cat.name === categoryName) || null;
}; 