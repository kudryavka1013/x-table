import { ICounter } from "./types";
import $ from "./dom";
// will be export
import "./index.css";

const CSS = {
  // wrapper: "x-table-wrapper",
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
  /* Custom cell render function */
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
      this.addRow(-1);
    }
  }

  initColgroup() {
    const { cols } = this.getTableSize();
    for (let i = 0; i < cols; i++) {
      const col = this.createCol();
      this.colgroup.appendChild(col);
    }
  }

  getTableSize() {
    return this.counter;
  }

  addRow(index = -1) {
    const { cols } = this.getTableSize();
    const newRow = this.createRow(cols);

    /* 找到index对应的当前行位置，在前面插一个空行 */
    if (index > 0 && index <= cols) {
      const row = this.getRow(index);
      this.tbody.insertBefore(newRow, row);
    } else {
      this.tbody.appendChild(newRow);
    }
  }

  addCol(index = -1) {
    const { rows, cols } = this.getTableSize();
    for (let i = 0; i < rows; i++) {
      const td = this.createCell();
      const curRow = this.getRow(i + 1);
      const curTd = this.getCell(i + 1, index);
      if (index > 0 && index <= cols) {
        curRow?.insertBefore(td, curTd);
      } else {
        curRow?.appendChild(td);
      }
    }
  }

  /* ----- Getters ----- */
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
  createCell = (): HTMLTableCellElement => {
    const td = $.make("td", CSS.cell);
    if (this.cellRender) {
      this.cellRender(td);
    } else {
      td.setAttribute("contenteditable", "true");
    }
    return td;
  };

  /**
   * Create tr and fill td elements
   */
  createRow = (numOfCols: number): HTMLTableRowElement => {
    const row = $.make("tr", CSS.row);
    $.batchAppend(row, () => this.createCell(), numOfCols);
    return row;
  };

  /**
   * Create colgroup-col element
   */
  createCol = (width?: number): HTMLTableColElement => {
    const col = $.make("col");
    col.style.width = width ? `${width}px` : "100px";
    console.log(col)
    return col;
  };
}
