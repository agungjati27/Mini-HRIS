export const LEAVE_TYPES = {
  SICK: "cuti_sakit",
  MATERNITY: "cuti_melahirkan",
  IMPORTANT: "cuti_alasan_penting",
};

export const LEAVE_TYPE_LABELS = {
  cuti_sakit: "Cuti Sakit",
  cuti_melahirkan: "Cuti Melahirkan",
  cuti_alasan_penting: "Cuti Alasan Penting",
};

export const LEAVE_CONSTRAINTS = {
  cuti_sakit: "Maks: Unlimited (butuh bukti dokter)",
  cuti_melahirkan: "Maks: 3 bulan (90 hari)",
  cuti_alasan_penting: "Maks: 1 minggu (7 hari)",
};

export const LEAVE_DESCRIPTIONS = {
  cuti_sakit: "Diajukan karena alasan kesehatan yang memerlukan surat keterangan dari dokter",
  cuti_melahirkan: "Maksimal 3 bulan (90 hari): 1,5 bulan sebelum melahirkan dan 1,5 bulan setelah melahirkan",
  cuti_alasan_penting: "Cuti dengan alasan keperluan pribadi yang penting, maksimal 7 hari kerja",
};
