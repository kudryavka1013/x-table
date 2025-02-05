import dom from "../packages/x-table/src/dom";

const CSS = {
  wrapper: "x-table-wrapper",
  scrollableWrapper: "x-table-scrollable-wrapper",
  scrollableContainer: "x-table-scrollable-container",
  table: "x-table",
  tableFixed: "x-table--fixed",
  colgroup: "x-table-colgroup",
  tbody: "x-table-tbody",
  row: "x-table-row",
  td: "x-table-cell",
  cellContentWrapper: "x-cell-content-wrapper",
  cellSafeArea: "x-cell-safe-area",
  cellContentBlock: "x-cell-content-block",
  operationBar: "x-table-operation-bar",
  headerBar: "x-table-operation-header-bar",
  headerBarCol: "x-table-operation-header-bar-col",
  headerBarRow: "x-table-operation-header-bar-row",
  insertBar: "x-table-insert-bar",
  insertBarCol: "x-table-insert-bar-col",
  insertBarRow: "x-table-insert-bar-row",
  insertZone: "x-table-insert-zone",
  insertPoint: "x-table-insert-point",
  header: "x-table-header",
  toolbox: "x-table-toolbox",
};

/**
 * Create base table elements
 */
export const createBaseTable = () => {
  const table = dom.make("table", [CSS.table, CSS.tableFixed]);
  const colgroup = dom.make("colgroup", CSS.colgroup);
  const tbody = dom.make("tbody", CSS.tbody);

  dom.append(table, [colgroup, tbody]);

  return {
    table,
    colgroup,
    tbody,
  };
};

/**
 * Create table td element
 */
export const createCell = (
  cellRender?: (td: HTMLTableCellElement) => void
): HTMLTableCellElement => {
  const td = dom.make("td", CSS.td);
  if (cellRender) {
    cellRender(td);
  }
  return td;
};

/**
 * Create tr and fill td elements
 */
export const createRow = (
  numOfCols: number,
  cellRender?: (td: HTMLTableCellElement) => void
): HTMLTableRowElement => {
  const row = dom.make("tr", CSS.row);
  dom.batchAppend(row, () => createCell(cellRender), numOfCols);
  return row;
};

/**
 * Create colgroup-col element
 */
export const createColWidth = (width?: number): HTMLTableColElement => {
  const col = dom.make("col");
  col.style.width = width ? `${width}px` : "100px";
  return col;
};

// /**
//  * @description: Create operation bar header
//  */
// export const createHeader = (): HTMLDivElement =>
//   make("div", CSS.header);

// /**
//  * @description: Create operation bar insert zone
//  */
// export const createInsertZone = (): HTMLDivElement =>
//   append(
//     make("div", CSS.insertZone),
//     make("div", CSS.insertPoint)
//   );

// /**
//  * @description: Create operation bar
//  */
// export const createOperationBar = () => {
//   const operationBar = make("div", CSS.operationBar);
//   const headerBarCol = make("div", [
//     CSS.headerBar,
//     CSS.headerBarCol,
//   ]);
//   const headerBarRow = make("div", [
//     CSS.headerBar,
//     CSS.headerBarRow,
//   ]);
//   const insertBarCol = make("div", [
//     CSS.insertBar,
//     CSS.insertBarCol,
//   ]);
//   const insertBarRow = make("div", [
//     CSS.insertBar,
//     CSS.insertBarRow,
//   ]);
//   // batchAppend(headerBarCol, createHeader, cols);
//   // batchAppend(insertBarCol, createInsertZone, cols);
//   // batchAppend(headerBarRow, createHeader, rows);
//   // batchAppend(insertBarRow, createInsertZone, rows);

//   append(operationBar, [
//     headerBarCol,
//     headerBarRow,
//     insertBarCol,
//     insertBarRow,
//   ]);
//   return {
//     operationBar,
//     headerBarCol,
//     headerBarRow,
//     insertBarCol,
//     insertBarRow,
//   };
// };

// /**
//  * @description: Create toolbox
//  */
// export const createToolbox = () => {
//   const toolbox = make("div", CSS.toolbox);
//   return toolbox;
// };

// interface ICreateTableWrapperParams extends ICreateBaseTable {}
// interface ICreateTableWrapper {
//   wrapper: HTMLDivElement;
//   operationBar: {
//     headerBarCol: HTMLDivElement;
//     headerBarRow: HTMLDivElement;
//     insertBarCol: HTMLDivElement;
//     insertBarRow: HTMLDivElement;
//   };
// }
// /**
//  * @description: Create wrapper elements and compose with base table
//  */
// export const createTableWrapper = (
//   baseTableElements: ICreateTableWrapperParams
// ): ICreateTableWrapper => {
//   const { table, colgroup, tbody } = baseTableElements;
//   const wrapper = make("div", CSS.wrapper);
//   const scrollableWrapper = make("div", CSS.scrollableWrapper);
//   const scrollableContainer = make("div", CSS.scrollableContainer);
//   // const table = make("table", [CSS.table, CSS.tableFixed]);
//   // const colgroup = make("colgroup", CSS.colgroup);
//   // const tbody = make("tbody", CSS.tbody);
//   const {
//     operationBar,
//     headerBarCol,
//     headerBarRow,
//     insertBarCol,
//     insertBarRow,
//   } = createOperationBar();
//   linkAppend(
//     wrapper,
//     scrollableWrapper,
//     append(scrollableContainer, [
//       append(table, [colgroup, tbody]),
//       operationBar,
//     ])
//   );

//   return {
//     wrapper,
//     operationBar: { headerBarCol, headerBarRow, insertBarCol, insertBarRow },
//   };
// };

// const contentWrapper = make("div", CSS.cellContentWrapper);
// const safeArea = make("div", CSS.cellSafeArea);
// const contentBlock = make("div", CSS.cellContentBlock);
// contentBlock.setAttribute("contentEditable", "true");
/* compose element */
// linkAppend(td, contentWrapper, safeArea, contentBlock);
