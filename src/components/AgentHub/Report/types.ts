export type ReportVersionItem = {
  id: string;
  /** ISO 或可解析时间串 */
  at: string;
  by?: string;
};

export type ReportExportApi = {
  fetchVersions: (reportId: string) => Promise<ReportVersionItem[]>;
  fetchPreviewHtml: (reportId: string, snapshot?: unknown) => Promise<{ html: string }>;
  archive: (payload: {
    reportId: string;
    archivedBy: string;
    snapshot?: unknown;
    eventSource?: string;
    eventLabel?: string;
  }) => Promise<void>;
  downloadDocx?: (reportId: string, snapshot?: unknown) => Promise<void>;
  fetchDetail?: (reportId: string) => Promise<{ report: unknown; meta?: unknown }>;
};
