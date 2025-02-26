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
  cellMerged: "x-table-cell--merged",
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

type UpdateMergeInfoType = "addRow" | "addColumn" | "deleteRow" | "deleteColumn";

interface MergeState {
  rowspan: number;
  colspan: number;
}

export default class XTable {
  /* DOM Nodes */
  private table: HTMLTableElement;
  private colgroup: HTMLTableColElement;
  private tbody: HTMLTableSectionElement;
  /* Table Data */
  private data: string[][];
  private rowCnt: number;
  private colCnt: number;
  /** Merge State
   * - Key format: 'rowIndex,columnIndex'
   */
  private mergeInfo: Record<string, MergeState>;
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

  constructor(data: string[][], rows: number, cols: number, cellRender?: (td: HTMLTableCellElement) => void) {
    const { table, colgroup, tbody } = this.createBaseTable();
    this.table = table;
    this.colgroup = colgroup;
    this.tbody = tbody;
    this.data = data;
    this.rowCnt = rows;
    this.colCnt = cols;
    this.mergeInfo = {};
    this.selectState = {
      startRow: 0,
      startCol: 0,
      endRow: 0,
      endCol: 0,
    };
    this.cellRender = cellRender ? cellRender : this.defaultCellRender;
    this.initTableCells(rows);
    this.initColgroup();
  }

  defaultCellRender = (td: HTMLTableCellElement) => {
    td.setAttribute("contenteditable", "true");
  };

  initTableCells(rows: number) {
    /* fill TRs and TDs */
    for (let i = 0; i < rows; i++) {
      this.addRow(0, true);
    }
  }

  initColgroup() {
    const { cols } = this.getTableSize();
    for (let i = 0; i < cols; i++) {
      const col = this.createCol();
      this.colgroup.appendChild(col);
    }
  }

  /* ----- Utils ----- */
  /** get position index */
  getIndex(position: string) {
    return position.split(",").map(Number);
  }

  /** compute real select range by merge state */
  computeRealRange(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number
  ): { startPosition: [number, number]; endPosition: [number, number] } {
    let newStartRow = startRow,
      newStartColumn = startColumn,
      newEndRow = endRow,
      newEndColumn = endColumn;
    // get merge state
    const mergeKeys = Object.keys(this.mergeInfo).filter((key) => {
      const [row, col] = key.split(",").map(Number);
      return row >= startRow && row <= endRow && col >= startColumn && col <= endColumn;
    });

    for (let i = 0; i < mergeKeys.length; i++) {
      const { rowspan, colspan } = this.mergeInfo[mergeKeys[i]]!;
      // expand range to cover merged cells
      const [row, col] = mergeKeys[i].split(",").map(Number);
      newEndRow = row + rowspan - 1 > endRow ? row + rowspan - 1 : endRow;
      newEndColumn = col + colspan - 1 > endColumn ? col + colspan - 1 : endColumn;
    }

    if (newStartRow === startRow && newStartColumn === startColumn && newEndRow === endRow && newEndColumn === endColumn) {
      return {
        startPosition: [startRow, startColumn],
        endPosition: [endRow, endColumn],
      };
    } else {
      return this.computeRealRange(newStartRow, newStartColumn, newEndRow, newEndColumn);
    }
  }

  /** update merge info after modifying table */
  updateMergeInfo(type: UpdateMergeInfoType, index: number) {
    const mergeInfo = JSON.parse(JSON.stringify(this.mergeInfo));
    const newMergeInfo: Record<string, MergeState> = {};

    for (const key in mergeInfo) {
      const isRowOperation = type === "addRow" || type === "deleteRow";
      const isAddOperation = type === "addRow" || type === "addColumn";
      // get row and column index
      const [row, col] = this.getIndex(key);
      // get rowspan and colspan
      const { rowspan, colspan } = mergeInfo[key];
      // revert position if need
      const [pos, rPos] = isRowOperation ? [row, col] : [col, row];
      // revert span if need
      const [span, rspan] = isRowOperation ? [rowspan, colspan] : [colspan, rowspan];
      // calculate new position
      const newPos = isAddOperation ? (index <= pos ? pos + 1 : pos) : index <= pos ? pos - 1 : pos;
      // calculate new row and column index
      const [newRow, newCol] = isRowOperation ? [newPos, rPos] : [rPos, newPos];
      // calculate new span
      const newSpan = index > pos && index <= pos - 1 + span ? (isAddOperation ? span + 1 : span - 1) : span;
      // calculate new rowspan and colspan
      const [newRowspan, newColspan] = isRowOperation ? [newSpan, rspan] : [rspan, newSpan];

      // 删除行列为合并单元格本体行列时，清除被合并的单元格的样式数据，无需再记录 map
      if (!isAddOperation && index === pos) {
        for (let i = 0; i < rowspan; i++) {
          for (let j = 0; j < colspan; j++) {
            const cell = this.getCell(row + i, col + j);
            if (cell) {
              cell.classList.remove(CSS.cellMerged);
            }
          }
        }
        continue;
      }
      // 插入的行列穿过合并单元格时，新增的单元格调整合并样式
      if (isAddOperation && newSpan !== span) {
        const counter = isRowOperation ? colspan : rowspan;
        for (let i = 0; i < counter; i++) {
          const cell = isRowOperation ? this.getCell(index, col + i) : this.getCell(row + i, index);
          if (cell) {
            cell.classList.add(CSS.cellMerged);
          }
        }
      }

      /* 通用处理 */
      // 插入/删除的行列穿过合并单元格时
      if (newSpan !== span) {
        // 更新合并单元格的 rowspan colspan
        const cell = this.getCell(row, col);
        if (cell) {
          cell.setAttribute("rowspan", `${newRowspan}`);
          cell.setAttribute("colspan", `${newColspan}`);
        }
      }
      // 更新 map 数据
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

  /* ----- Table Operations ----- */
  addRow(index = 0, init = false) {
    const { cols } = this.getTableSize();
    const newRow = this.createRow(cols);

    if (index > 0 && index <= cols) {
      /* non-zero, find index and insert before */
      const row = this.getRow(index);
      this.tbody.insertBefore(newRow, row);
      /* update mergeInfo */
      this.mergeInfo = this.updateMergeInfo("addRow", index);
    } else {
      /* zero, add row to the end */
      this.tbody.appendChild(newRow);
    }
    /* update counter */
    if (!init) {
      this.rowCnt++;
    }
  }

  addColumn(index = 0) {
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

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("addColumn", index);

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

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("deleteRow", index);
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

    /* update mergeInfo */
    this.mergeInfo = this.updateMergeInfo("deleteColumn", index);

    const col = this.getCol(index);
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
    console.log(realRange);
    this.selectState = {
      startRow: realRange.startPosition[0],
      startCol: realRange.startPosition[1],
      endRow: realRange.endPosition[0],
      endCol: realRange.endPosition[1],
    };
  }

  mergeCells(startPosition: [number, number], endPosition: [number, number]) {
    // need to be real select range
    this.setSelectState(startPosition, endPosition);
    const { startRow, startCol, endRow, endCol } = this.selectState;
    // set rowspan colspan
    // hide merged cells
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        const cell = this.getCell(i, j);
        if (cell) {
          if (i === startRow && j === startCol) {
            cell.setAttribute("rowspan", `${endRow - startRow + 1}`);
            cell.setAttribute("colspan", `${endCol - startCol + 1}`);
            this.mergeInfo[`${i},${j}`] = {
              rowspan: endRow - startRow + 1,
              colspan: endCol - startCol + 1,
            };
          } else {
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
          const cell = this.getCell(position[0] + i, position[1] + j);
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
    return this.tbody.querySelector<HTMLTableRowElement>(`tr:nth-child(${row})`);
  }

  getCell(row: number, col: number) {
    return this.tbody.querySelector<HTMLTableCellElement>(`tr:nth-child(${row}) td:nth-child(${col})`);
  }

  getCol(col: number) {
    return this.colgroup.querySelector<HTMLTableColElement>(`col:nth-child(${col})`);
  }

  getMergeInfo() {
    return this.mergeInfo;
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
    console.log(this.data);
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
