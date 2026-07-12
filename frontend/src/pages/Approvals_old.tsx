import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  X,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { normalizeRole } from "../utils/auth";
import { leaveService } from "../services/leaveService";
import {
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  LEAVE_DESCRIPTIONS,
} from "../constants/leaveTypes";

interface LeaveRequest {
  id: string;
  type: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approved_days?: number | null;
  admin_note?: string;
  attachment_url?: string;
  created_at: string;
  updated_at?: string;
  employee?: {
    id: string;
    full_name: string;
    nik: string;
    department: string;
    position: string;
  };
}

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role ?? user?.user?.role ?? "");
  const isAdmin = role === "admin";

  // Tab state
  const [activeTab, setActiveTab] = useState<"requests" | "submissions">(
    isAdmin ? "requests" : "submissions"
  );

  // Form state
  const [formData, setFormData] = useState({
    type: "",
    reason: "",
    attachment_url: "",
  });

  // List states
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review modal state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewingRequest, setReviewingRequest] = useState<LeaveRequest | null>(null);
  const [reviewData, setReviewData] = useState({
    status: "approved" as "approved" | "rejected",
    admin_note: "",
    approved_days: 0,
  });

  // File upload state
  const [fileUploading, setFileUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = isAdmin
        ? await leaveService.getAllLeaveRequests()
        : await leaveService.getMyLeaveRequests();

      setRequests(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat permohonan");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.type || !formData.reason) {
      setError("Tipe cuti dan alasan wajib diisi");
      return;
    }

    // Validate sick leave must have attachment
    if (formData.type === LEAVE_TYPES.SICK && !formData.attachment_url) {
      setError("Cuti sakit memerlukan surat keterangan dokter");
      return;
    }

    try {
      setLoading(true);
      await leaveService.submitLeaveRequest({
        type: formData.type,
        reason: formData.reason,
        attachment_url: formData.attachment_url || undefined,
      });

      setSuccess("Permohonan cuti berhasil diajukan");
      setFormData({
        type: "",
        reason: "",
        attachment_url: "",
      });

      // Reload requests
      setTimeout(() => loadRequests(), 500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengajukan permohonan");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async () => {
    if (!reviewingId || !reviewingRequest) return;

    setError("");
    setSuccess("");

    if (reviewData.status === "approved") {
      // For sick and important leave, admin must set approved days
      if ([LEAVE_TYPES.SICK, LEAVE_TYPES.IMPORTANT].includes(reviewingRequest.type)) {
        if (!reviewData.approved_days || reviewData.approved_days < 1) {
          setError("Jumlah hari cuti yang disetujui wajib diisi");
          return;
        }
      }
      // For maternity leave, auto set to 90 days
      if (reviewingRequest.type === LEAVE_TYPES.MATERNITY) {
        reviewData.approved_days = 90;
      }
    }

    try {
      setLoading(true);
      await leaveService.reviewLeaveRequest(reviewingId, {
        status: reviewData.status,
        admin_note: reviewData.admin_note || undefined,
        approved_days: reviewData.approved_days || undefined,
      });

      setSuccess("Permohonan cuti berhasil diperbarui");
      setReviewingId(null);
      setReviewingRequest(null);
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui permohonan");
    } finally {
      setLoading(false);
    }
  };
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.type || !formData.start_date || !formData.end_date || !formData.reason) {
      setError("Semua field wajib diisi");
      return;
    }

    if (formData.type === LEAVE_TYPES.SICK && !formData.attachment_url) {
      setError("Cuti sakit memerlukan surat keterangan dokter");
      return;
    }

    const days = calculateDays(formData.start_date, formData.end_date);

    // Validate constraints
    if (formData.type === LEAVE_TYPES.IMPORTANT && days > 7) {
      setError("Cuti alasan penting maksimal 7 hari");
      return;
    }

    if (formData.type === LEAVE_TYPES.MATERNITY && days > 90) {
      setError("Cuti melahirkan maksimal 90 hari");
      return;
    }

    try {
      setLoading(true);
      await leaveService.submitLeaveRequest({
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        attachment_url: formData.attachment_url || undefined,
      });

      setSuccess("Permohonan cuti berhasil diajukan");
      setFormData({
        type: "",
        start_date: "",
        end_date: "",
        reason: "",
        attachment_url: "",
      });

      // Reload requests
      setTimeout(() => loadRequests(), 500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengajukan permohonan");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async () => {
    if (!reviewingId) return;

    setError("");
    setSuccess("");

    if (reviewData.status === "approved") {
      // Get the leave request to check type
      const request = requests.find((r) => r.id === reviewingId);
      if (
        [LEAVE_TYPES.SICK, LEAVE_TYPES.IMPORTANT].includes(request?.type || "")
      ) {
        if (!reviewData.approved_days || reviewData.approved_days < 1) {
          setError("Jumlah hari cuti yang disetujui wajib diisi");
          return;
        }
      }
    }

    try {
      setLoading(true);
      await leaveService.reviewLeaveRequest(reviewingId, {
        status: reviewData.status,
        admin_note: reviewData.admin_note || undefined,
        approved_days: reviewData.approved_days || undefined,
      });

      setSuccess("Permohonan cuti berhasil diperbarui");
      setReviewingId(null);
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui permohonan");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File terlalu besar. Maksimal 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Tipe file tidak didukung. Gunakan PDF, JPG, PNG, DOC, atau DOCX");
      return;
    }

    // For now, just store the file name/reference
    // In a real app, you would upload to storage (Supabase, etc)
    setFileUploading(true);
    setError("");

    try {
      // Simulating file upload - in reality you'd use Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      setFormData((prev) => ({
        ...prev,
        attachment_url: fileName,
      }));
      setSuccess("File berhasil diupload");
    } catch (err) {
      setError("Gagal mengupload file");
    } finally {
      setFileUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const RequestCard: React.FC<{ request: LeaveRequest; showEmployee?: boolean }> = ({
    request,
    showEmployee = false,
  }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {showEmployee && request.employee && (
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              {request.employee.full_name}
            </p>
          )}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {LEAVE_TYPE_LABELS[request.type as keyof typeof LEAVE_TYPE_LABELS] ||
              request.type}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {LEAVE_CONSTRAINTS[request.type as keyof typeof LEAVE_CONSTRAINTS]}
          </p>
        </div>
        <div className="ml-2">{getStatusBadge(request.status)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Tanggal</p>
          <p className="text-slate-900 dark:text-white font-medium">
            {new Date(request.start_date).toLocaleDateString("id-ID")} -{" "}
            {new Date(request.end_date).toLocaleDateString("id-ID")}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            ({calculateDays(request.start_date, request.end_date)} hari)
          </p>
        </div>
        {request.approved_days !== null && request.approved_days !== undefined && (
          <div>
            <p className="text-slate-500 dark:text-slate-400">Hari Disetujui</p>
            <p className="text-slate-900 dark:text-white font-medium">
              {request.approved_days} hari
            </p>
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Alasan:
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300">{request.reason}</p>
      </div>

      {request.attachment_url && (
        <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">📄 {request.attachment_url}</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {request.admin_note && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs border-l-2 border-blue-400">
          <p className="text-blue-700 dark:text-blue-300 font-medium">Catatan Admin:</p>
          <p className="text-blue-600 dark:text-blue-400">{request.admin_note}</p>
        </div>
      )}

      {isAdmin && request.status === "pending" && (
        <button
          onClick={() => {
            setReviewingId(request.id);
            setReviewData({
              status: "approved",
              admin_note: "",
              approved_days: calculateDays(request.start_date, request.end_date),
            });
          }}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors"
        >
          Review
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Permohonan Cuti
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {isAdmin
              ? "Kelola permohonan cuti dari semua karyawan"
              : "Ajukan dan lihat permohonan cuti Anda"}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        {!isAdmin && (
          <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "submissions"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              Pengajuan Cuti Saya
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "requests"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              Ajukan Cuti Baru
            </button>
          </div>
        )}

        {/* Admin View - All Requests */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Daftar Permohonan Cuti
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Memuat data...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  Tidak ada permohonan cuti
                </p>
              </div>
            ) : (
              <div>
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showEmployee={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Employee View - Submit New Request */}
        {!isAdmin && activeTab === "requests" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Ajukan Permohonan Cuti Baru
            </h2>

            <form onSubmit={handleSubmitRequest}>
              {/* Leave Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipe Cuti
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Pilih Tipe Cuti</option>
                  <option value={LEAVE_TYPES.SICK}>
                    Cuti Sakit (Perlu Surat Dokter)
                  </option>
                  <option value={LEAVE_TYPES.MATERNITY}>
                    Cuti Melahirkan (Max 3 bulan)
                  </option>
                  <option value={LEAVE_TYPES.IMPORTANT}>
                    Cuti Alasan Penting (Max 1 minggu)
                  </option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Days Display */}
              {formData.start_date && formData.end_date && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Total Hari:</strong>{" "}
                    {calculateDays(formData.start_date, formData.end_date)} hari
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Alasan
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Jelaskan alasan cuti Anda..."
                />
              </div>

              {/* File Upload - Sick Leave */}
              {formData.type === LEAVE_TYPES.SICK && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    📄 Surat Keterangan Dokter
                  </label>

                  {!formData.attachment_url ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={fileUploading}
                        className="hidden"
                        id="doctor-file-input"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label
                        htmlFor="doctor-file-input"
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {fileUploading
                                ? "Mengupload..."
                                : dragActive
                                  ? "Lepaskan file di sini"
                                  : "Klik atau drag file ke sini"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              PDF, JPG, PNG, DOC, DOCX (Maksimal 10MB)
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              File Berhasil Diupload
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {formData.attachment_url}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            attachment_url: "",
                          }))
                        }
                        className="text-sm font-medium text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 underline"
                      >
                        Ganti File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Mengirim..." : "Ajukan Permohonan"}
              </button>
            </form>
          </div>
        )}

        {/* Employee View - My Submissions */}
        {!isAdmin && activeTab === "submissions" && (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Memuat data...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  Anda belum mengajukan cuti
                </p>
              </div>
            ) : (
              <div>
                {requests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingId && isAdmin && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Review Permohonan Cuti
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setReviewData((prev) => ({ ...prev, status: "approved" }))
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reviewData.status === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Setujui
                </button>
                <button
                  onClick={() =>
                    setReviewData((prev) => ({ ...prev, status: "rejected" }))
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reviewData.status === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Tolak
                </button>
              </div>
            </div>

            {reviewData.status === "approved" && (
              <>
                {[LEAVE_TYPES.SICK, LEAVE_TYPES.IMPORTANT].includes(
                  requests.find((r) => r.id === reviewingId)?.type || ""
                ) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Jumlah Hari Cuti yang Disetujui
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reviewData.approved_days}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          approved_days: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catatan (Optional)
              </label>
              <textarea
                value={reviewData.admin_note}
                onChange={(e) =>
                  setReviewData((prev) => ({ ...prev, admin_note: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Tambahkan catatan..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReviewingId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReviewRequest}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
