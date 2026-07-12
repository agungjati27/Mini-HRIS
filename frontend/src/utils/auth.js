export const normalizeRole = (role) => {
  if (!role) return "";

  const normalized = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (["admin", "administrator", "super_admin", "superadmin", "hr_admin", "owner"].includes(normalized)) {
    return "admin";
  }

  if (["employee", "staff", "member", "user"].includes(normalized)) {
    return "employee";
  }

  return normalized;
};

const normalizeUser = (user) => {
  if (!user) return null;

  const normalizedRole = normalizeRole(user.role ?? user.user?.role);
  const nextUser = {
    ...user,
    role: normalizedRole,
  };

  if (user.user) {
    nextUser.user = {
      ...user.user,
      role: normalizeRole(user.user.role),
    };
  }

  return nextUser;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return normalizeUser(JSON.parse(user));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const hasRole = (role) => {
  const user = getUser();
  return normalizeRole(user?.role) === normalizeRole(role);
};