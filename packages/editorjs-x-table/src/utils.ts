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
