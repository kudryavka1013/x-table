/** Create element with optional classlist
 * @return HTML element
 */
const make = <T extends keyof HTMLElementTagNameMap>(tagName: T, classnames?: string | string[]) => {
  const elem = document.createElement(tagName);
  if (classnames) addClass(elem, classnames);
  return elem as HTMLElementTagNameMap[T];
};

/** Append multiple elements into one parent element
 * @return Parent element
 */
const append = <T extends HTMLElement | DocumentFragment>(parentElem: T, elem: HTMLElement | HTMLElement[]) => {
  Array.isArray(elem) ? elem.forEach((i) => parentElem.append(i)) : parentElem.append(elem);
  return parentElem;
};

/** batch append elements by generator function
 * @return Parent element
 */
const batchAppend = (parentElem: HTMLElement | DocumentFragment, generator: () => HTMLElement | HTMLElement[], count = 1) => {
  for (let c = 0; c < count; c++) {
    append(parentElem, generator());
  }
  return parentElem;
};

/** Combine elements to a chain structure
 * @return The first element
 */
const linkAppend = (...elems: HTMLElement[]) => {
  if (elems.length === 0) return null;
  elems.reduce((p, c) => p.appendChild(c));
  return elems[0].parentElement;
};

/** Add multiple classnames
 * @return HTML element
 */
const addClass = (elem: HTMLElement, classnames: string | string[]) => {
  Array.isArray(classnames) ? elem.classList.add(...classnames) : elem.classList.add(classnames);
  return elem;
};

export const domUtils = {
  make,
  append,
  batchAppend,
  linkAppend,
  addClass,
};

/** Format the table and calculate the number of rows and columns in the table data
 * @param data - The table data
 * @returns The number of rows and columns
 */
const formatTableData = (data?: string[][]): { fData: string[][]; rows: number; cols: number } => {
  // If no data is provided, return default data, 2 rows & 2 cols
  if (!data || data.length === 0 || data.every((row) => row.length === 0)) {
    return {
      fData: [
        ["", ""],
        ["", ""],
      ],
      rows: 2,
      cols: 2,
    };
  }

  const rows = data.length;
  let cols = 0;
  // Look for the longest row
  if (rows > 0) {
    cols = data.reduce((max, row) => Math.max(max, row.length), 0);
  }
  const fData = data.map((row) => {
    // Copy the original array and pad it
    return Array.from({ length: cols }, (_, i) => row[i] ?? "");
  });
  return { fData, rows, cols };
};

const isValidNumber = (value: any): boolean => {
  return typeof value === "number" && !isNaN(value);
};

const isInteger = (value: any): boolean => {
  return Number.isInteger(value);
};

export const tableUtils = {
  formatTableData,
  isValidNumber,
};
