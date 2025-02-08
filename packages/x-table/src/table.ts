import $ from "./dom";

export const CSS = {
  // wrapper: "x-table-wrapper",
  // scrollableWrapper: "x-table-scrollable-wrapper",
  // scrollableContainer: "x-table-scrollable-container",
  table: "x-table",
  // tableFixed: "x-table--fixed",
  colgroup: "x-table-colgroup",
  col: "x-table-col",
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

interface MergeState {
  merged: boolean;
  /* the top-left one is the main cell */
  mainCell: string;
  rowspan: number;
  colspan: number;
}

export default class XTable {
  /* DOM Nodes */
  private table: HTMLTableElement;
  private colgroup: HTMLTableColElement;
  private tbody: HTMLTableSectionElement;
  /* Table Data */
  private rowCnt: number;
  private colCnt: number;
  /** Merge State
   * - Key format: 'rowIndex-columnIndex'
   */
  private mergeState: Map<string, MergeState>;
  /** Select State
   * start cell index and end cell index, start from 1
   */
  private selectState: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  };
  /* Custom cell render function */
  cellRender: (td: HTMLTableCellElement) => void;

  constructor(
    rows: number,
    cols: number,
    cellRender?: (td: HTMLTableCellElement) => void
  ) {
    const { table, colgroup, tbody } = this.createBaseTable();
    this.table = table;
    this.colgroup = colgroup;
    this.tbody = tbody;
    this.rowCnt = rows;
    this.colCnt = cols;
    this.mergeState = new Map();
    this.selectState = {
      startRow: 0,
      startCol: 0,
      endRow: 0,
      endCol: 0,
    };
    this.cellRender = cellRender ? cellRender : this.defaultCellRender;
    this.initTableCells();
    this.initColgroup();
  }

  defaultCellRender = (td: HTMLTableCellElement) => {
    td.setAttribute("contenteditable", "true");
  };

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

  /* ----- Table Operations ----- */
  addRow(index = -1) {
    const { cols } = this.getTableSize();
    const newRow = this.createRow(cols);

    /* 找到 index 对应的当前行位置，在前面插一个空行 */
    if (index > 0 && index <= cols) {
      const row = this.getRow(index);
      this.tbody.insertBefore(newRow, row);
    } else {
      this.tbody.appendChild(newRow);
    }

    /* update counter */
    this.rowCnt++;
  }

  addColumn(index = -1) {
    const { rows, cols } = this.getTableSize();
    for (let i = 0; i < rows; i++) {
      const td = this.createCell();
      const curRow = this.getRow(i + 1);
      if (index > 0 && index <= cols) {
        const curTd = this.getCell(i + 1, index);
        curRow?.insertBefore(td, curTd);
      } else {
        curRow?.appendChild(td);
      }
    }

    /* update colgroup */
    const col = this.createCol();
    if (index > 0 && index <= cols) {
      const curCol = this.colgroup.children[index - 1];
      this.colgroup.insertBefore(col, curCol);
    } else {
      this.colgroup.appendChild(col);
    }

    /* update counter */
    this.colCnt++;
  }

  deleteRow(index: number) {
    const { rows } = this.getTableSize();
    if (index <= 0 || index > rows) return;
    const row = this.getRow(index);
    if (row) {
      row.remove();
      this.rowCnt--;
    }
  }

  deleteColumn(index: number) {
    const { rows, cols } = this.getTableSize();
    if (index <= 0 || index > cols) return;

    for (let i = 0; i < rows; i++) {
      const cell = this.getCell(i + 1, index);
      if (cell) {
        cell.remove();
      }
    }

    const col = this.getCol(index);
    if (col) {
      col.remove();
      this.colCnt--;
    }
  }

  setSelectState(
    startPosition: [number, number],
    endPosition: [number, number]
  ) {
    // if opposite selection action, revert coordinates
    const [a, b] = startPosition;
    const [x, y] = endPosition;

    let [startRow, endRow] = x - a >= 0 ? [a, x] : [x, a];
    let [startColumn, endColumn] = y - b >= 0 ? [b, y] : [y, b];

    this.computeRealRange([startRow, startColumn], [endRow, endColumn]);
  }

  computeRealRange(
    startPosition: [number, number],
    endPosition: [number, number]
  ) {
    // compute real select range by merge state
    this.computeRealRange(startPosition, endPosition);
  }

  mergeCells(startPosition: [number, number], endPosition: [number, number]) {
    // need to be real select range
  }

  splitCell(position: [number, number]) {}

  /* ----- Getters ----- */
  getTable() {
    return {
      table: this.table,
      colgroup: this.colgroup,
      tbody: this.tbody,
    };
  }

  getTableSize() {
    return {
      rows: this.rowCnt,
      cols: this.colCnt,
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

  getCol(col: number) {
    return this.colgroup.querySelector<HTMLTableColElement>(
      `col:nth-child(${col})`
    );
  }

  getMergeData() {
    return this.mergeState;
  }

  getData() {
    const { rows, cols } = this.getTableSize();
    const data: string[][] = [];
    for (let i = 0; i < rows; i++) {
      const rowData: string[] = [];
      for (let j = 0; j < cols; j++) {
        const cell = this.getCell(i + 1, j + 1);
        if (!cell) continue;
        rowData.push(cell.innerText);
      }
      data.push(rowData);
    }
    return data;
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
    td.setAttribute("rowspan", "1");
    td.setAttribute("colspan", "1");
    this.cellRender(td);
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
  createCol = (width?: number, span?: number): HTMLTableColElement => {
    const col = $.make("col", CSS.col);
    col.style.width = width ? `${width}px` : "100px";
    if (span) {
      col.setAttribute("span", `${span}`);
    }
    return col;
  };
}
