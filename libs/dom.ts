/* base DOM operation utils */

/* create an element */
const make = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  className?: string | string[]
) => {
  const elem = document.createElement(tagName);
  if (className) addClass(elem, className);
  return elem as HTMLElementTagNameMap[T];
};

/* multiple append elements */
const append = <T extends HTMLElement | DocumentFragment>(
  wrapper: T,
  elem: HTMLElement | HTMLElement[]
) => {
  Array.isArray(elem)
    ? elem.forEach((i) => wrapper.append(i))
    : wrapper.append(elem);
  return wrapper;
};

/* batch append elements by generatorFunc */
const batchAppend = (
  wrapper: HTMLElement | DocumentFragment,
  elem: () => HTMLElement | HTMLElement[],
  count = 1
) => {
  for (let c = 0; c < count; c++) {
    append(wrapper, elem());
  }
};

/* generate element tree */
const linkAppend = (...elems: HTMLElement[]) => {
  elems.reduce((p, c) => p.appendChild(c));
};

const addClass = (elem: HTMLElement, className: string | string[]) => {
  Array.isArray(className)
    ? elem.classList.add(...className)
    : elem.classList.add(className);
};

const dom = {
  make,
  append,
  batchAppend,
  linkAppend,
  addClass,
};
export default dom;
