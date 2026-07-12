const supabase = require("../config/supabase");

const normalizeStatus = (value) => {
  const nextStatus = String(value || "").trim().toLowerCase();
  return nextStatus === "inactive" ? "inactive" : "active";
};

const buildEmployeePayload = (body = {}) => {
  const payload = {};

  const fields = [
    "full_name",
    "nik",
    "gender",
    "birth_date",
    "phone",
    "address",
    "department",
    "position",
    "join_date",
    "status",
  ];

  fields.forEach((field) => {
    const value = body[field];

    if (value === undefined) {
      return;
    }

    if (field === "status") {
      payload.status = normalizeStatus(value);
      return;
    }

    if (field === "birth_date" || field === "join_date") {
      payload[field] = value || null;
      return;
    }

    if (value === "") {
      payload[field] = null;
      return;
    }

    payload[field] = value;
  });

  return payload;
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const client = supabase;

    const { data, error } = await client
      .from("employees")
      .select(`
        id,
        profile_id,
        nik,
        full_name,
        department,
        position,
        status
      `)
      .eq("profile_id", userId)
      .maybeSingle();

    if (error) {
      return res.status(404).json({
        message: "Data employee tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// ADMIN: GET ALL EMPLOYEES
// ===============================
exports.getAllEmployees = async (req, res) => {
  try {
    const client = supabase;
    const { data, error } = await client
      .from("employees")
      .select(`
        id,
        profile_id,
        nik,
        full_name,
        gender,
        birth_date,
        phone,
        address,
        department,
        position,
        join_date,
        status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      message: "Data employees berhasil diambil",
      total: data?.length || 0,
      data: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// ADMIN: CREATE EMPLOYEE
// ===============================
exports.createEmployee = async (req, res) => {
  try {
    const payload = buildEmployeePayload(req.body);

    if (!payload.full_name || !payload.nik) {
      return res.status(400).json({ message: "Nama lengkap dan NIK wajib diisi" });
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        ...payload,
        status: payload.status || "active",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Employee berhasil ditambahkan",
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// ADMIN: UPDATE EMPLOYEE
// ===============================
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildEmployeePayload(req.body);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang dikirim" });
    }

    const client = supabase;
    const { data, error } = await client
      .from("employees")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Employee berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// ADMIN: DELETE EMPLOYEE
// ===============================
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const client = supabase;
    const { data, error } = await client
      .from("employees")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Employee berhasil dihapus",
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// ADMIN: UPDATE EMPLOYEE STATUS
// ===============================
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const nextStatus = String(status || "").toLowerCase().trim();
    if (!["active", "inactive"].includes(nextStatus)) {
      return res.status(400).json({ message: "status harus active atau inactive" });
    }

    const client = supabase;
    const { data, error } = await client
      .from("employees")
      .update({ status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return res.json({
      message: "Status employee berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile: exports.getProfile,
  getAllEmployees: exports.getAllEmployees,
  createEmployee: exports.createEmployee,
  updateEmployee: exports.updateEmployee,
  deleteEmployee: exports.deleteEmployee,
  updateEmployeeStatus: exports.updateEmployeeStatus,
  buildEmployeePayload,
};
