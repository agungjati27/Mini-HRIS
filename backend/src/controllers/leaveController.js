const { supabaseAdmin: supabaseAdminClient } = require("../config/supabase");

const LEAVE_TYPES = {
  SICK: "cuti_sakit",
  MATERNITY: "cuti_melahirkan",
  IMPORTANT: "cuti_alasan_penting",
};

const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const normalizeLeaveStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "submitted") {
    return LEAVE_STATUS.PENDING;
  }

  if ([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED, LEAVE_STATUS.PENDING].includes(normalized)) {
    return normalized;
  }

  return LEAVE_STATUS.PENDING;
};

const resolveEmployeeForUser = async (supabaseClient, userId) => {
  const { data: existingEmployee, error: employeeError } = await supabaseClient
    .from("employees")
    .select("id, profile_id, full_name, nik, department, position, status")
    .eq("profile_id", userId)
    .maybeSingle();

  if (employeeError) {
    throw employeeError;
  }

  if (existingEmployee) {
    return existingEmployee;
  }

  const { data: createdEmployee, error: insertError } = await supabaseClient
    .from("employees")
    .insert({
      profile_id: userId,
      status: "active",
    })
    .select("id, profile_id, full_name, nik, department, position, status")
    .single();

  if (insertError) {
    throw insertError;
  }

  return createdEmployee;
};

// Validate leave submission (check required fields and constraints)
const validateLeaveSubmission = (type, reason, attachmentUrl = null) => {
  if (!type || !reason) {
    return { valid: false, message: "Tipe cuti dan alasan wajib diisi" };
  }

  // Check if type is valid
  if (![LEAVE_TYPES.SICK, LEAVE_TYPES.MATERNITY, LEAVE_TYPES.IMPORTANT].includes(type)) {
    return { valid: false, message: "Tipe cuti tidak valid" };
  }

  // Sick leave MUST have attachment
  if (type === LEAVE_TYPES.SICK && !attachmentUrl) {
    return { valid: false, message: "Cuti sakit memerlukan surat keterangan dokter" };
  }

  return { valid: true };
};

const createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const client = supabaseAdminClient;

    const employee = await resolveEmployeeForUser(client, userId);

    const { type, reason, attachment_url } = req.body;

    // Validate submission
    const validation = validateLeaveSubmission(type, reason, attachment_url);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { data: created, error } = await client
      .from("leave_requests")
      .insert({
        employee_id: employee.id,
        type,
        reason: String(reason).trim(),
        attachment_url: attachment_url || null,
        status: LEAVE_STATUS.PENDING,
        approved_days: null, // Will be set by admin
        admin_note: null,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Permohonan cuti berhasil diajukan",
      data: created,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const client = supabaseAdminClient;
    const employee = await resolveEmployeeForUser(client, userId);

    const { data, error } = await client
      .from("leave_requests")
      .select("*")
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      message: "Permohonan berhasil diambil",
      total: data?.length || 0,
      data: data || [],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllRequestsForAdmin = async (req, res) => {
  try {
    const { data, error } = await supabaseAdminClient
      .from("leave_requests")
      .select(`
        id,
        created_at,
        type,
        reason,
        status,
        admin_note,
        approved_days,
        attachment_url,
        employees (
          id,
          full_name,
          nik,
          department,
          position
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // normalize join shape
    const list = (data || []).map((row) => ({
      ...row,
      employee: row.employees,
    }));

    return res.json({
      message: "Data permohonan berhasil diambil",
      total: list.length,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const adminReviewRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note, approved_days } = req.body;

    const nextStatus = normalizeLeaveStatus(status);
    if (![LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED].includes(nextStatus)) {
      return res.status(400).json({ message: "Status harus approved atau rejected" });
    }

    const note = admin_note ? String(admin_note).trim() : null;

    // Get the leave request to check type
    const { data: leaveRequest } = await supabaseAdminClient
      .from("leave_requests")
      .select("type")
      .eq("id", id)
      .single();

    let finalApprovedDays = approved_days;

    // For maternity leave, auto set to 90 days
    if (nextStatus === LEAVE_STATUS.APPROVED && leaveRequest?.type === LEAVE_TYPES.MATERNITY) {
      finalApprovedDays = 90;
    }

    // For sick leave and important reason leave, admin must specify approved_days
    if (
      nextStatus === LEAVE_STATUS.APPROVED &&
      [LEAVE_TYPES.SICK, LEAVE_TYPES.IMPORTANT].includes(leaveRequest?.type)
    ) {
      if (approved_days === undefined || approved_days === null) {
        return res.status(400).json({
          message: `Untuk ${leaveRequest.type}, jumlah hari cuti yang disetujui wajib ditentukan`,
        });
      }
      if (typeof approved_days !== "number" || approved_days < 1) {
        return res.status(400).json({ message: "Jumlah hari cuti harus angka positif" });
      }
    }

    const updateData = {
      status: nextStatus,
      admin_note: note,
    };

    if (nextStatus === LEAVE_STATUS.APPROVED && finalApprovedDays !== undefined) {
      updateData.approved_days = finalApprovedDays;
    }

    const { data, error } = await supabaseAdminClient
      .from("leave_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Permohonan cuti berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequestsForAdmin,
  adminReviewRequest,
  LEAVE_TYPES,
  LEAVE_STATUS,
  normalizeLeaveStatus,
  resolveEmployeeForUser,
};
