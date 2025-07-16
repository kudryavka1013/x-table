/** Operation types for table modifications */
export type OperationType = "addRow" | "addColumn" | "deleteRow" | "deleteColumn";

/** State of a merged cell */
export interface MergeState {
  rowspan: number;
  colspan: number;
}
