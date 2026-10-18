"use client";

import * as React from "react";
import { CircleAlert, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

/* Session 57 (R57-A): REF's "Bulk Import Employees" dialog — the recipe
   live-measured at 1440×900 (the r57 census phase A). The at-rest recipe
   is verbatim; the flow behind it is the WORKING superset (REF's own
   "Process File" is broken live — it fails on its own template's format,
   measured: "Failed to parse CSV file. Please check the format."):
   template download (REF's exact 7-column blob) → file pick (the
   filename swap + the Process File → Processing... states) → the
   client-side parse → per-row validation (REF's destructive
   "Validation Errors:" alert) → the review table → Import →
   POST /api/employees/import → the honest created/skipped summary. */

/** REF's own template blob (live-captured from the download button). */
const CSV_TEMPLATE =
  "full_name,email,job_title,start_date,phone,department_id,template_id\n" +
  "John Doe,john@example.com,Software Engineer,2024-01-15,+966501234567,,\n" +
  "Jane Smith,jane@example.com,HR Manager,2024-02-01,+966501234568,,\n";

interface ParsedRow {
  row: number;
  full_name: string;
  email: string;
  job_title: string;
  start_date: string;
  phone: string;
  department_id: string;
  template_id: string;
}

/** Minimal CSV line splitter (handles quoted fields + embedded commas). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function parseCsv(text: string): ParsedRow[] | string {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return "The file has no data rows.";
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const required = ["full_name", "email", "job_title", "start_date"];
  for (const col of required) {
    if (!header.includes(col)) return `Missing required column: ${col}`;
  }
  const idx = (col: string) => header.indexOf(col);
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.length < 2) return `Row ${i + 1}: not enough columns.`;
    rows.push({
      row: i + 1,
      full_name: cells[idx("full_name")] ?? "",
      email: cells[idx("email")] ?? "",
      job_title: cells[idx("job_title")] ?? "",
      start_date: cells[idx("start_date")] ?? "",
      phone: idx("phone") >= 0 ? (cells[idx("phone")] ?? "") : "",
      department_id: idx("department_id") >= 0 ? (cells[idx("department_id")] ?? "") : "",
      template_id: idx("template_id") >= 0 ? (cells[idx("template_id")] ?? "") : "",
    });
  }
  return rows;
}

function validateRows(rows: ParsedRow[]): string[] {
  const errors: string[] = [];
  for (const r of rows) {
    if (!r.full_name) errors.push(`Row ${r.row}: full_name is required`);
    if (!r.email) errors.push(`Row ${r.row}: email is required`);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push(`Row ${r.row}: invalid email (${r.email})`);
    if (!r.job_title) errors.push(`Row ${r.row}: job_title is required`);
    if (!r.start_date) errors.push(`Row ${r.row}: start_date is required`);
    else if (Number.isNaN(new Date(r.start_date).getTime())) errors.push(`Row ${r.row}: invalid start_date (${r.start_date})`);
  }
  return errors;
}

export function BulkImportDialog({ onImported }: { onImported?: () => void }) {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [rows, setRows] = React.useState<ParsedRow[] | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [importing, setImporting] = React.useState(false);

  function reset() {
    setFile(null);
    setProcessing(false);
    setRows(null);
    setErrors([]);
    setImporting(false);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-import-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setRows(null);
    setErrors([]);
    e.target.value = "";
  }

  function processFile() {
    if (!file) return;
    setProcessing(true);
    void (async () => {
      try {
        const text = await file.text();
        const parsed = parseCsv(text);
        if (typeof parsed === "string") {
          setErrors([parsed]);
          setRows(null);
        } else {
          const problems = validateRows(parsed);
          if (problems.length > 0) {
            setErrors(problems);
            setRows(null);
          } else {
            setErrors([]);
            setRows(parsed);
          }
        }
      } catch {
        setErrors(["Failed to parse CSV file. Please check the format."]);
        setRows(null);
      } finally {
        setProcessing(false);
      }
    })();
  }

  function importRows() {
    if (!rows || rows.length === 0) return;
    setImporting(true);
    void (async () => {
      try {
        const res = await fetch("/api/employees/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        const json = await res.json();
        if (!json.ok) {
          toast.toast({ title: "Import failed", description: json.error?.message, variant: "error" });
          return;
        }
        const created: unknown[] = json.data.created;
        const skipped: { row: number; reason: string }[] = json.data.skipped;
        toast.toast({
          title: `Imported ${created.length} employee${created.length === 1 ? "" : "s"}`,
          description:
            skipped.length > 0
              ? `${skipped.length} row${skipped.length === 1 ? "" : "s"} skipped (first: row ${skipped[0].row} — ${skipped[0].reason}).`
              : "All rows imported.",
          variant: "success",
        });
        setOpen(false);
        reset();
        onImported?.();
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setImporting(false);
      }
    })();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
          {/* Session 47 (R46-G1): REF's OLD-lucide upload glyph, hand-authored. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-upload w-4 h-4 mr-2"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="tracking-tight text-2xl flex items-center gap-2">
            Bulk Import Employees
            <FileSpreadsheet className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* REF's info alert (the shadcn default variant, verbatim markup) */}
          <div
            role="alert"
            className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 bg-background text-foreground"
          >
            <CircleAlert className="w-4 h-4" aria-hidden="true" />
            <div className="text-sm [&_p]:leading-relaxed">
              <div className="space-y-2">
                <p className="font-medium">How to import employees:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Download the CSV template below</li>
                  <li>Fill in employee information (required: full_name, email, job_title, start_date)</li>
                  <li>Upload the completed CSV file</li>
                  <li>Review the data and click Import</li>
                </ol>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download CSV Template
          </Button>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFilePicked}
              />
              <label htmlFor="csv-file" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" aria-hidden="true" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  {file ? file.name : "Click to upload CSV file"}
                </p>
                <p className="text-sm text-slate-500">or drag and drop your CSV file here</p>
              </label>
            </div>

            {file && !rows && errors.length === 0 ? (
              <Button onClick={processFile} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  "Process File"
                )}
              </Button>
            ) : null}

            {errors.length > 0 ? (
              <div
                role="alert"
                className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
              >
                <CircleAlert className="w-4 h-4" aria-hidden="true" />
                <div className="text-sm [&_p]:leading-relaxed">
                  <div className="space-y-2">
                    <p className="font-medium">Validation Errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {errors.slice(0, 10).map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {rows && rows.length > 0 ? (
              <div className="rounded-xl border bg-card shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map((r) => (
                      <TableRow key={r.row}>
                        <TableCell>{r.row}</TableCell>
                        <TableCell>{r.full_name}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.job_title}</TableCell>
                        <TableCell>{r.start_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {rows.length > 20 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Showing the first 20 of {rows.length} rows.
                  </p>
                ) : null}
                <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-200">
                  <Label className="text-sm text-muted-foreground">
                    {rows.length} valid row{rows.length === 1 ? "" : "s"} ready to import
                  </Label>
                  <Button onClick={importRows} disabled={importing}>
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Importing...
                      </>
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
