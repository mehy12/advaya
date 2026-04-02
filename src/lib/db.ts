import { neon } from "@neondatabase/serverless";

if (!process.env.NEON_DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEON_DATABASE_URL is not set. Report APIs will be disabled.");
}

const sql = process.env.NEON_DATABASE_URL ? neon(process.env.NEON_DATABASE_URL) : null;

export type ReportRecord = {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  severity: number | null;
  title: string | null;
  description: string | null;
  imageBase64: string | null;
  timestamp: string;
  isUserReport: boolean;
};

export async function createReport(input: {
  latitude: number;
  longitude: number;
  type: string;
  severity?: number;
  title?: string;
  description?: string;
  imageBase64?: string;
  timestamp?: string;
  isUserReport?: boolean;
}): Promise<ReportRecord> {
  if (!sql) {
    throw new Error("Neon database is not configured");
  }

  const id = crypto.randomUUID();
  const timestamp = input.timestamp ?? new Date().toISOString();
  const isUserReport = input.isUserReport ?? true;

  const rows = await sql`
    INSERT INTO reports (
      id,
      latitude,
      longitude,
      type,
      severity,
      title,
      description,
      image_base64,
      timestamp,
      is_user_report
    )
    VALUES (
      ${id},
      ${input.latitude},
      ${input.longitude},
      ${input.type},
      ${input.severity ?? null},
      ${input.title ?? null},
      ${input.description ?? null},
      ${input.imageBase64 ?? null},
      ${timestamp},
      ${isUserReport}
    )
    RETURNING
      id,
      latitude,
      longitude,
      type,
      severity,
      title,
      description,
        image_base64 as "imageBase64",
        timestamp,
        is_user_report as "isUserReport";
      ` as unknown as ReportRecord[];

      return rows[0];
}

export async function listReports(limit = 100): Promise<ReportRecord[]> {
  if (!sql) return [];

  const rows = await sql`
    SELECT
      id,
      latitude,
      longitude,
      type,
      severity,
      title,
      description,
      image_base64 as "imageBase64",
      timestamp,
      is_user_report as "isUserReport"
    FROM reports
    ORDER BY timestamp DESC
    LIMIT ${limit};
  ` as unknown as ReportRecord[];

  return rows;
}

export async function deleteReport(id: string): Promise<void> {
  if (!sql) return;
  await sql`DELETE FROM reports WHERE id = ${id};`;
}
