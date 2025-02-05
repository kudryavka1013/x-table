import { ICounter } from "./types";
import $ from "./dom";
import "./index.css";

const CSS = {
  wrapper: "x-table-wrapper",
  // scrollableWrapper: "x-table-scrollable-wrapper",
  // scrollableContainer: "x-table-scrollable-container",
  table: "x-table",
  // tableFixed: "x-table--fixed",
  colgroup: "x-table-colgroup",
  tbody: "x-table-tbody",
  row: "x-table-row",
  cell: "x-table-cell",
  // cellContentWrapper: "x-cell-content-wrapper",
  // cellSafeArea: "x-cell-safe-area",
  // cellContentBlock: "x-cell-content-block",
  // operationBar: "x-table-operation-bar",
  // headerBar: "x-table-operation-header-bar",
  // headerBarCol: "x-table-operation-header-bar-col",
  // headerBarRow: "x-table-operation-header-bar-row",
  // insertBar: "x-table-insert-bar",
  // insertBarCol: "x-table-insert-bar-col",
  // insertBarRow: "x-table-insert-bar-row",
  // insertZone: "x-table-insert-zone",
  // insertPoint: "x-table-insert-point",
  // header: "x-table-header",
  // toolbox: "x-table-toolbox",
};

export default class XTable {
  /* DOM Nodes */
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  tbody: HTMLTableSectionElement;
  /* Counter */
  counter: ICounter;

  cellRender?: (td: HTMLTableCellElement) => void;

  constructor(
    rows: number,
    cols: number,
    cellRender?: (td: HTMLTableCellElement) => void
  ) {
    const { table, colgroup, tbody } = this.createBaseTable();
    this.table = table;
    this.colgroup = colgroup;
    this.tbody = tbody;
    this.counter = {
      rows,
      cols,
    };
    this.cellRender = cellRender;
    this.initTableCells();
    this.initColgroup();
  }

  initTableCells() {
    const { rows } = this.getTableSize();
    /* fill TRs and TDs */
    for (let i = 0; i < rows; i++) {
      this.addRow(-1, this.cellRender);
    }
  }

  initColgroup() {
    const { cols } = this.getTableSize();
    for (let i = 0; i < cols; i++) {
      const col = document.createElement("col");
      this.colgroup.appendChild(col);
    }
  }

  getTableSize() {
    return this.counter;
  }

  addRow(index = -1, renderCell?: (td: HTMLTableCellElement) => void) {
    const { cols } = this.getTableSize();
    const newRow = this.createRow(cols, renderCell);

    /* 找到index对应的当前行位置，在前面插一个空行 */
    if (index > 0 && index <= cols) {
      const row = this.getRow(index);
      this.tbody.insertBefore(newRow, row);
    } else {
      this.tbody.appendChild(newRow);
    }
  }

  addCol(index = -1, renderCell?: (td: HTMLTableCellElement) => void) {
    const { rows, cols } = this.getTableSize();
    for (let i = 0; i < rows; i++) {
      const td = this.createCell(renderCell);
      const curRow = this.getRow(i + 1);
      const curTd = this.getCell(i + 1, index);
      if (index > 0 && index <= cols) {
        curRow?.insertBefore(td, curTd);
      } else {
        curRow?.appendChild(td);
      }
    }
  }

  getTable() {
    return {
      table: this.table,
      colgroup: this.colgroup,
      tbody: this.tbody,
    };
  }

  getRow(row: number) {
    return this.tbody.querySelector<HTMLTableRowElement>(
      `tr:nth-child(${row})`
    );
  }

  getCell(row: number, col: number) {
    return this.tbody.querySelector<HTMLTableCellElement>(
      `tr:nth-child(${row}) td:nth-child(${col})`
    );
  }

  /* ----- DOM Operations ----- */
  /**
   * Create base table elements
   */
  createBaseTable = () => {
    const table = $.make("table", [CSS.table]);
    const colgroup = $.make("colgroup", CSS.colgroup);
    const tbody = $.make("tbody", CSS.tbody);

    $.append(table, [colgroup, tbody]);

    return {
      table,
      colgroup,
      tbody,
    };
  };

  /**
   * Create table td element
   */
  createCell = (
    cellRender?: (td: HTMLTableCellElement) => void
  ): HTMLTableCellElement => {
    const td = $.make("td", CSS.cell);
    if (cellRender) {
      cellRender(td);
    } else {
      td.setAttribute("contenteditable", "true");
    }
    return td;
  };

  /**
   * Create tr and fill td elements
   */
  createRow = (
    numOfCols: number,
    cellRender?: (td: HTMLTableCellElement) => void
  ): HTMLTableRowElement => {
    const row = $.make("tr", CSS.row);
    console.log(cellRender);
    $.batchAppend(row, () => this.createCell(cellRender), numOfCols);
    return row;
  };
}
