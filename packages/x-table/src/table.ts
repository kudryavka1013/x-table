import { MergeState, OperationType } from "./types";
import { domUtils as $, tableUtils as t } from "./utils";

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
  cellMerged: "x-table-cell--merged",
  cellTextBlock: "x-table-cell-text-block",
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
  // #region ---------- Variables -----------------
  /* DOM Nodes */
  private table!: HTMLTableElement;
  private colgroup!: HTMLTableColElement;
  private tbody!: HTMLTableSectionElement;

  /* Table Data */
  private data!: string[][];
  /* Table Size */
  private rowCnt!: number;
  private colCnt!: number;

  /** Merge State
   * - key format: 'rowIndex,columnIndex'
   * - index starts from 1
   */
  private mergeInfo: Record<string, MergeState>;

  /** Select State
   * start cell index and end cell index, start from 1
   */
  private selectState: {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
  };

  /* Custom cell render function */
  cellRender: (data?: string) => HTMLElement;

  // #endregion

  // #region ---------- Inner Functions -----------
  constructor(data?: string[][], mergeInfo?: Record<string, MergeState>, cellRender?: (data?: string) => HTMLElement) {
    const { fData, rows, cols } = t.formatTableData(data);
    const { table, colgroup, tbody } = this.createBaseTable();
    this.table = table;
    this.colgroup = colgroup;
    this.tbody = tbody;
    this.data = fData;
    this.rowCnt = rows;
    this.colCnt = cols;
    this.cellRender = cellRender ? cellRender : this.defaultCellRender;

    this.initTableByData();

    // TODO: Implement merge info
    this.mergeInfo = mergeInfo || {};
    // this.initMergeState();

    this.selectState = {
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 0,
    };
  }

  /** Default cell render, include one edit unit */
  private defaultCellRender(data?: string): HTMLElement {
    const div = $.make("div", CSS.cellTextBlock);
    div.setAttribute("contenteditable", "true");
    div.innerHTML = data || "<br>";
    return div;
  }

  /** Initialize table by data */
  private initTableByData() {
    const newRows = Array.from({ length: this.rowCnt }, (_, i) => this.createTableRow(this.colCnt, this.data[i]));
    $.append(this.tbody, newRows);
    const newCols = Array.from({ length: this.colCnt }, () => this.createColgroupCol());
    $.append(this.colgroup, newCols);
  }

  /** compute real select range by merge state */
  private computeRealRange(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number
  ): { startRow: number; startColumn: number; endRow: number; endColumn: number } {
    let newStartRow = startRow,
      newStartColumn = startColumn,
      newEndRow = endRow,
      newEndColumn = endColumn;
    // get merge state
    // First filter out the merged cells to the right and below the selected range to reduce the amount of calculation
    const mergeKeys = Object.keys(this.mergeInfo).filter((key) => {
      const [row, col] = key.split(",").map(Number);
      return row <= endRow && col <= endColumn;
    });

    // Calculate and expand the selected range
    for (let i = 0; i < mergeKeys.length; i++) {
      const { rowspan, colspan } = this.mergeInfo[mergeKeys[i]];
      const [row, col] = mergeKeys[i].split(",").map(Number);
      // expand range to cover merged cells
      // The merged cell and the selected range overlap, determined by whether the bottom-right corner of the merged cell crosses the selected range
      if (row + rowspan - 1 >= startRow && col + colspan - 1 >= startColumn) {
        newStartRow = Math.min(row, startRow);
        newStartColumn = Math.min(col, startColumn);
        newEndRow = Math.max(row + rowspan - 1, endRow);
        newEndColumn = Math.max(col + colspan - 1, endColumn);
      }
    }

    // The selected range has not expanded, and the calculation ends
    if (newStartRow === startRow && newStartColumn === startColumn && newEndRow === endRow && newEndColumn === endColumn) {
      return {
        startRow,
        startColumn,
        endRow,
        endColumn,
      };
    } else {
      return this.computeRealRange(newStartRow, newStartColumn, newEndRow, newEndColumn);
    }
  }

  /** update merge info after modifying table */
  private updateMergeInfo(type: OperationType, index: number) {
    const mergeInfo = JSON.parse(JSON.stringify(this.mergeInfo));
    const newMergeInfo: Record<string, MergeState> = {};

    for (const key in mergeInfo) {
      const isRowOperation = type === "addRow" || type === "deleteRow";
      const isAddOperation = type === "addRow" || type === "addColumn";
      // get row and column index
      const [row, col] = t.getIndex(key);
      // get rowspan and colspan
      const { rowspan, colspan } = mergeInfo[key];
      // revert position if need
      const [pos, rPos] = isRowOperation ? [row, col] : [col, row];
      // revert span if need
      const [span, rSpan] = isRowOperation ? [rowspan, colspan] : [colspan, rowspan];
      // calculate new position
      const newPos = isAddOperation ? (index <= pos ? pos + 1 : pos) : index <= pos ? pos - 1 : pos;
      // calculate new row and column index
      const [newRow, newCol] = isRowOperation ? [newPos, rPos] : [rPos, newPos];
      // calculate new span
      const newSpan = index > pos && index <= pos - 1 + span ? (isAddOperation ? span + 1 : span - 1) : span;
      // calculate new rowspan and colspan
      const [newRowspan, newColspan] = isRowOperation ? [newSpan, rSpan] : [rSpan, newSpan];

      // When deleting rows and columns that are merged cells, clear the style data of the merged cells and no longer need to record the map
      if (!isAddOperation && index === pos) {
        for (let i = 0; i < rowspan; i++) {
          for (let j = 0; j < colspan; j++) {
            const cell = this.getTableCell(row + i, col + j);
            if (cell) {
              cell.classList.remove(CSS.cellMerged);
            }
          }
        }
        continue;
      }
      // When the inserted rows and columns pass through merged cells, the newly added cells adjust the merge style
      if (isAddOperation && newSpan !== span) {
        const counter = isRowOperation ? colspan : rowspan;
        for (let i = 0; i < counter; i++) {
          const cell = isRowOperation ? this.getTableCell(index, col + i) : this.getTableCell(row + i, index);
          if (cell) {
            cell.classList.add(CSS.cellMerged);
          }
        }
      }

      /* 通用处理 */
      // When the inserted/deleted rows and columns pass through merged cells
      if (newSpan !== span) {
        // update mergedCell's rowspan colspan
        const cell = this.getTableCell(row, col);
        if (cell) {
          cell.setAttribute("rowspan", `${newRowspan}`);
          cell.setAttribute("colspan", `${newColspan}`);
        }
      }
      // update map
      if (newRowspan !== 1 || newColspan !== 1) {
        newMergeInfo[`${newRow},${newCol}`] = { ...mergeInfo[key], rowspan: newRowspan, colspan: newColspan };
      }

      // switch (type) {
      //   case "addRow":
      //   case "addColumn":
      //     // 插入行列穿过合并单元格时
      //     if (newSpan !== span) {
      //       // 新增的单元格调整合并样式
      //       const counter = isRowOperation ? colspan : rowspan;
      //       for (let i = 0; i < counter; i++) {
      //         const cell = isRowOperation ? this.getCell(index, col + i) : this.getCell(row + i, index);
      //         if (cell) {
      //           cell.classList.add(CSS.cellMerged);
      //         }
      //       }
      //       // 更新合并单元格的 rowspan colspan
      //       const cell = this.getCell(row, col);
      //       if (cell) {
      //         cell.setAttribute("rowspan", `${newRowspan}`);
      //         cell.setAttribute("colspan", `${newColspan}`);
      //       }
      //     }
      //     // 更新 map 数据
      //     if (newRowspan !== 1 || newColspan !== 1) {
      //       newMergeInfo[`${newRow},${newCol}`] = { ...mergeInfo[key], rowspan: newRowspan, colspan: newColspan };
      //     }
      //     break;
      //   case "deleteRow":
      //   case "deleteColumn":
      //     // 删除行列为合并单元格本体行列时，清除被合并的单元格的样式数据，无需再记录 map
      //     if (index === pos) {
      //       for (let i = 0; i < rowspan; i++) {
      //         for (let j = 0; j < colspan; j++) {
      //           const cell = this.getCell(row + i, col + j);
      //           if (cell) {
      //             cell.classList.remove(CSS.cellMerged);
      //           }
      //         }
      //       }
      //     } else {
      //       // 插入行列穿过合并单元格时
      //       if (newSpan !== span) {
      //         // 更新合并单元格的 rowspan colspan
      //         const cell = this.getCell(row, col);
      //         if (cell) {
      //           cell.setAttribute("rowspan", `${newRowspan}`);
      //           cell.setAttribute("colspan", `${newColspan}`);
      //         }
      //       }
      //       // 更新 map 数据
      //       if (newRowspan !== 1 || newColspan !== 1) {
      //         newMergeInfo[`${newRow},${newCol}`] = { ...mergeInfo[key], rowspan: newRowspan, colspan: newColspan };
      //       }
      //     }
      // }
    }

    return newMergeInfo;
  }
  // #endregion

  // #region ---------- Table Operations ----------
  addRow(index = 0) {
    const { cols } = this.getTableSize();
    const newRow = this.createTableRow(cols);

    if (index > 0 && index <= cols) {
      /* non-zero, find index and insert before */
      const row = this.getTableRow(index);
      if (row) {
        this.tbody.insertBefore(newRow, row);
        /* update mergeInfo */
        this.mergeInfo = this.updateMergeInfo("addRow", index);
      }
    } else {
      /* zero, add row to the end */
      this.tbody.appendChild(newRow);
    }
    /* update counter */
    this.rowCnt++;
  }

  addColumn(index = 0) {
    const { rows, cols } = this.getTableSize();
    for (let i = 0; i < rows; i++) {
      const td = this.createTableCell();
      const curRow = this.getTableRow(i + 1);
      if (index > 0 && index <= cols) {
        const curTd = this.getTableCell(i + 1, index);
        if (curTd) {
          curRow?.insertBefore(td, curTd);
        } else {
          console.warn("XTable: invalid cell index");
          return;
        }
      } else {
        curRow?.appendChild(td);
      }
    }

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("addColumn", index);

    /* update colgroup */
    const col = this.createColgroupCol();
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
    if (!t.isInteger(index) || index > rows || rows <= 1) {
      console.warn("XTable: invalid row index or is last row");
      return;
    }
    const row = this.getTableRow(index);
    if (row) {
      row.remove();
      this.rowCnt--;
    }

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("deleteRow", index);
  }

  deleteColumn(index: number) {
    const { rows, cols } = this.getTableSize();
    if (!t.isInteger(index) || index > cols || cols <= 1) {
      console.warn("XTable: invalid column index or is last column");
      return;
    }

    for (let i = 0; i < rows; i++) {
      const cell = this.getTableCell(i + 1, index);
      if (cell) {
        cell.remove();
      }
    }

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("deleteColumn", index);

    const col = this.getColgroupCol(index);
    if (col) {
      col.remove();
      this.colCnt--;
    }
  }

  setSelectState(startPosition: [number, number], endPosition: [number, number]) {
    // if opposite selection action, revert coordinates
    const [a, b] = startPosition;
    const [x, y] = endPosition;

    let [startRow, endRow] = x - a >= 0 ? [a, x] : [x, a];
    let [startColumn, endColumn] = y - b >= 0 ? [b, y] : [y, b];

    const realRange = this.computeRealRange(startRow, startColumn, endRow, endColumn);
    this.selectState = {
      ...realRange,
    };
  }

  mergeCells(startPosition: [number, number], endPosition: [number, number]) {
    // need to be real select range
    this.setSelectState(startPosition, endPosition);
    const { startRow, startColumn, endRow, endColumn } = this.selectState;
    // set rowspan colspan
    // hide merged cells
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
        const cell = this.getTableCell(i, j);
        if (cell) {
          if (i === startRow && j === startColumn) {
            cell.setAttribute("rowspan", `${endRow - startRow + 1}`);
            cell.setAttribute("colspan", `${endColumn - startColumn + 1}`);
            this.mergeInfo[`${i},${j}`] = {
              rowspan: endRow - startRow + 1,
              colspan: endColumn - startColumn + 1,
            };
          } else {
            delete this.mergeInfo[`${i},${j}`];
            cell.classList.add(CSS.cellMerged);
            cell.setAttribute("rowspan", "1");
            cell.setAttribute("colspan", "1");
          }
        }
      }
    }
  }

  splitCell(position: [number, number]) {
    const mergeState = this.mergeInfo[position.join(",")];
    if (mergeState) {
      const { rowspan, colspan } = mergeState;
      // show merged cells
      for (let i = 0; i < rowspan; i++) {
        for (let j = 0; j < colspan; j++) {
          const cell = this.getTableCell(position[0] + i, position[1] + j);
          if (cell) {
            if (i === 0 && j === 0) {
              cell.setAttribute("rowspan", "1");
              cell.setAttribute("colspan", "1");
            } else {
              cell.classList.remove(CSS.cellMerged);
            }
            delete this.mergeInfo[`${position[0] + i},${position[1] + j}`];
          }
        }
      }
    }
  }
  // #endregion

  // #region ---------- Data Getters --------------
  /** Get table elements */
  getTableElements() {
    return {
      table: this.table,
      colgroup: this.colgroup,
      tbody: this.tbody,
    };
  }

  /** Get table size */
  getTableSize() {
    return {
      rows: this.rowCnt,
      cols: this.colCnt,
    };
  }

  /** Get specific row element */
  getTableRow(row: number = 1) {
    const tr = this.tbody.rows[row - 1];
    if (!tr) {
      console.warn("XTable: invalid row index");
      return undefined;
    }

    return tr;
  }

  /** Get specific cell element */
  getTableCell(row: number = 1, col: number = 1) {
    const td = this.tbody.rows[row - 1]?.cells[col - 1];
    if (!td) {
      console.warn("XTable: invalid cell index");
      return undefined;
    }
    return td;
  }

  getColgroupCol(col: number) {
    return this.colgroup.querySelector<HTMLTableColElement>(`col:nth-child(${col})`);
  }

  getMergeInfo() {
    return this.mergeInfo;
  }

  getSelectState() {
    return this.selectState;
  }

  getData() {
    const data = Array.from(this.tbody.rows, (tr) => Array.from(tr.cells, (cell) => cell.innerHTML));
    // check data
    const { rows, cols } = this.getTableSize();
    if (data.length !== rows || data.some((row) => row.length !== cols)) {
      console.warn("Table data is inconsistent with table size.");
    }
    return data;
  }

  // getStructureData() {
  //   const data = Array.from(this.tbody.rows, (tr) =>
  //     Array.from(tr.cells, (cell) => ({
  //       content: cell.innerHTML,
  //       rowspan: cell.rowSpan,
  //       colspan: cell.colSpan,
  //     }))
  //   );
  //   // check data
  //   const { rows, cols } = this.getTableSize();
  //   if (data.length !== rows || data.some((row) => row.length !== cols)) {
  //     console.warn("Table data is inconsistent with table size.");
  //   }
  //   return data;
  // }

  // #endregion

  // #region ---------- DOM Creators --------------
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
  createTableCell = (data?: string): HTMLTableCellElement => {
    const td = $.make("td", CSS.cell);
    td.setAttribute("rowspan", "1");
    td.setAttribute("colspan", "1");
    const renderUnit = this.cellRender(data);
    td.appendChild(renderUnit);
    return td;
  };

  /**
   * Create tr and fill td elements
   */
  createTableRow = (numOfCols: number, data?: string[]): HTMLTableRowElement => {
    const row = $.make("tr", CSS.row);
    $.appendByGenerator(row, (i) => this.createTableCell(data?.[i]), numOfCols);
    return row;
  };

  /**
   * Create colgroup-col element
   */
  createColgroupCol = (width?: number): HTMLTableColElement => {
    const col = $.make("col", CSS.col);
    col.setAttribute("width", width ? `${width}` : "100");
    return col;
  };

  // #endregion
}
