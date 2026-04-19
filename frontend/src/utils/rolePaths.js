export const getRoleDashboardPath = (role) => {
  if (role === "Admin") {
    return "/admin/dashboard";
  }

  return "/dashboard";
};
