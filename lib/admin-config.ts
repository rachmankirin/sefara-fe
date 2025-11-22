// Admin Configuration - Centralized admin settings and constants
export const ADMIN_CONFIG = {
  // Dashboard settings
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    maxRecentOrders: 5,
    lowStockThreshold: 10,
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Order statuses
  orderStatuses: [
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "shipped", label: "Shipped", color: "blue" },
    { value: "completed", label: "Completed", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" },
  ],

  // User roles
  userRoles: [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ],

  // Product categories
  productCategories: [
    { value: "cleanser", label: "Cleanser" },
    { value: "toner", label: "Toner" },
    { value: "serum", label: "Serum" },
    { value: "moisturizer", label: "Moisturizer" },
    { value: "sunscreen", label: "Sunscreen" },
  ],

  // Skin types
  skinTypes: [
    { value: "kering", label: "Kering (Dry)" },
    { value: "normal", label: "Normal" },
    { value: "kombinasi", label: "Kombinasi (Combination)" },
    { value: "berminyak", label: "Berminyak (Oily)" },
  ],
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  viewDashboard: "view_dashboard",
  manageBrands: "manage_brands",
  manageProducts: "manage_products",
  manageUsers: "manage_users",
  manageOrders: "manage_orders",
  viewAnalytics: "view_analytics",
  manageSettings: "manage_settings",
}

// Admin routes
export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  brands: "/admin/brands",
  products: "/admin/products",
  users: "/admin/users",
  orders: "/admin/orders",
  settings: "/admin/settings",
}
