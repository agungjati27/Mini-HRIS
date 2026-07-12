const supabase = require("../config/supabase");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.supabase || supabase;

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const { data: employee, error: employeeError } = await client
      .from("employees")
      .select("*")
      .eq("profile_id", userId)
      .maybeSingle();

    if (employeeError) {
      throw employeeError;
    }

    res.json({
      message: "Profile berhasil diambil",
      data: {
        profile,
        employee,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const client = req.supabase || supabase;
    const {
      email,
      password,
      full_name,
      nik,
      gender,
      birth_date,
      phone,
      address,
      department,
      position,
      join_date,
      status,
    } = req.body;

    const avatar = req.file;
    let avatarUrl;

    if (password && password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    if (avatar) {
      const extension = avatar.originalname.split(".").pop() || "jpg";
      const fileName = `${userId}/avatar-${Date.now()}.${extension}`;

      const uploadAvatar = await client.storage.from("avatars").upload(fileName, avatar.buffer, {
        contentType: avatar.mimetype,
        upsert: true,
      });

      if (uploadAvatar.error) {
        throw uploadAvatar.error;
      }

      const publicUrl = client.storage.from("avatars").getPublicUrl(fileName);
      avatarUrl = publicUrl.data.publicUrl;
    }

    const authUpdates = {};

    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);

      if (authError) {
        throw authError;
      }
    }

    const profileUpdates = {};

    if (email) profileUpdates.email = email;
    if (avatarUrl) profileUpdates.avatar_url = avatarUrl;

    if (Object.keys(profileUpdates).length) {
      const { error: profileError } = await client
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }
    }

    const employeePayload = {};

    if (nik !== undefined) employeePayload.nik = nik;
    if (full_name !== undefined) employeePayload.full_name = full_name;
    if (gender !== undefined) employeePayload.gender = gender;
    if (birth_date !== undefined) employeePayload.birth_date = birth_date || null;
    if (phone !== undefined) employeePayload.phone = phone;
    if (address !== undefined) employeePayload.address = address;
    if (department !== undefined) employeePayload.department = department;
    if (position !== undefined) employeePayload.position = position;
    if (join_date !== undefined) employeePayload.join_date = join_date || null;
    if (status !== undefined) employeePayload.status = status || "active";

    if (Object.keys(employeePayload).length) {
      const { data: existingEmployee, error: findEmployeeError } = await client
        .from("employees")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (findEmployeeError) {
        throw findEmployeeError;
      }

      let employeeError;

      if (existingEmployee) {
        const { error } = await client
          .from("employees")
          .update(employeePayload)
          .eq("id", existingEmployee.id);

        employeeError = error;
      } else {
        const { error } = await client.from("employees").insert({
          profile_id: userId,
          ...employeePayload,
          status: employeePayload.status || "active",
        });

        employeeError = error;
      }

      if (employeeError) {
        throw employeeError;
      }
    }

    const { data: profile } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: employee } = await client
      .from("employees")
      .select("*")
      .eq("profile_id", userId)
      .maybeSingle();

    res.json({
      message: "Profile berhasil diperbarui",
      data: {
        profile,
        employee,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
