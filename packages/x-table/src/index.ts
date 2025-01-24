import { ICounter } from "./types";
import { createBaseTable, createRow } from "../../../libs/utils";

export default class BaseTable {
  /* DOM Nodes */
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  tbody: HTMLTableSectionElement;
  /* Counter */
  counter: ICounter;

  constructor(rows: number, cols: number) {
    const { table, colgroup, tbody } = createBaseTable();
    this.table = table;
    this.colgroup = colgroup;
    this.tbody = tbody;
    this.counter = {
      rows,
      cols,
    };
    this.initTableCells();
    this.initColgroup();
  }

  initTableCells() {
    const { rows } = this.getTableSize();
    /* 填充行，包括内部 TD 元素 */
    for (let i = 0; i < rows; i++) {
      this.addRow(-1, this.renderCell);
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
    const newRow = createRow(cols, renderCell);

    /* 找到index对应的当前行位置，在前面插一个空行 */
    if (index > 0 && index <= cols) {
      const row = this.getRow(index);
      this.tbody.insertBefore(newRow, row);
    } else {
      this.tbody.appendChild(newRow);
    }

    return newRow;
  }

  addCol() {
    const { rows } = this.getTableSize();
    for (let i = 0; i < rows; i++) {
      const td = document.createElement("td");
    }
  }

  renderCell() {}

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
}
