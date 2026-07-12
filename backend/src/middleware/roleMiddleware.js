const supabase = require("../config/supabase");

const normalizeRole = (value) => {
  if (!value) return "";

  const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (["admin", "administrator", "super_admin", "superadmin", "hr_admin", "owner"].includes(normalized)) {
    return "admin";
  }

  if (["employee", "staff", "member", "user"].includes(normalized)) {
    return "employee";
  }

  return normalized;
};

const isRoleAllowed = (role, allowedRoles = []) => {
  const normalizedRole = normalizeRole(role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  return normalizedAllowedRoles.includes(normalizedRole);
};

/**
 * roleMiddleware(...allowedRoles)
 * - allowedRoles: array of roles that are permitted, e.g. ["admin"] or ["employee","admin"]
 * - Assumes authMiddleware ran before and set req.user (Supabase user object) with id.
 */
function roleMiddleware(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ message: "User tidak ditemukan" });
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const role = normalizeRole(profile?.role);
      if (!role) {
        return res.status(403).json({ message: "Role tidak valid" });
      }

      const isAllowed = isRoleAllowed(role, allowedRoles);
      if (!isAllowed) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      req.user.role = role;
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

module.exports = { roleMiddleware, normalizeRole, isRoleAllowed };
