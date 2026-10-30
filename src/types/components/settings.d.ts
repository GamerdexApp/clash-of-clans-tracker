import type { ImportMode } from "@/service/backup";
import type { AppData } from "@/types/app";

export interface ImportFile {
  name: string;
  size: number;
  text: string;
}

export interface ImportDialogProps {
  file: ImportFile | null;
  current: AppData;
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  onClose: () => void;
  onConfirm: (next: AppData, summary: string, mode: ImportMode) => void;
}
