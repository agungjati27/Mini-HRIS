import { supabase } from "../services/supabase";

export const uploadAttendancePhoto = async (file, employeeId) => {
  if (!employeeId) {
    throw new Error("Employee ID tidak tersedia untuk upload foto attendance");
  }

  const fileName = `${employeeId}/${Date.now()}.jpg`;
  const uploadFile =
    file instanceof File
      ? file
      : new File([file], fileName, { type: file.type || "image/jpeg" });

  const { error } = await supabase.storage
    .from("attendance")
    .upload(fileName, uploadFile, {
      contentType: uploadFile.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("attendance")
    .getPublicUrl(fileName);

  return {
    path: fileName,
    publicUrl: data.publicUrl,
  };
};
