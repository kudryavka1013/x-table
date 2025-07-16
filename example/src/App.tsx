import { useEffect, useRef } from "react";
import { XTable } from "@kudryavka1013/x-table";
import "@kudryavka1013/x-table/x-table.css";
import { CSS } from "@kudryavka1013/x-table";

function App() {
  const tableRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<XTable>();

  useEffect(() => {
    console.log("useEffect");
    const table = new XTable([]);
    actionRef.current = table;
    console.log(table)
    console.log(table.getTableElements().table)
    tableRef.current?.appendChild(table.getTableElements().table);
  }, []);

  const onAddCol = () => {
    console.log("onAddCol");
    console.log(actionRef.current);
    const add_col = document.getElementById("add_col") as HTMLInputElement;
    actionRef.current?.addColumn(parseInt(add_col.value));
  };

  const onAddRow = () => {
    console.log("onAddRow");
    console.log(actionRef.current);
    const add_row = document.getElementById("add_row") as HTMLInputElement;
    actionRef.current?.addRow(parseInt(add_row.value));
  };

  const onDelCol = () => {
    console.log("onDelCol");
    console.log(actionRef.current);
    const del_col = document.getElementById("del_col") as HTMLInputElement;
    actionRef.current?.deleteColumn(parseInt(del_col.value));
  };

  const onDelRow = () => {
    console.log("onDelRow");
    console.log(actionRef.current);
    const del_row = document.getElementById("del_row") as HTMLInputElement;
    actionRef.current?.deleteRow(parseInt(del_row.value));
  };

  const onMerge = () => {
    console.log("onMerge");
    console.log(actionRef.current);
    const merge = document.getElementById("merge") as HTMLInputElement;
    const [x1, y1, x2, y2] = merge.value.split(",");
    actionRef.current?.mergeCells([parseInt(x1), parseInt(y1)], [parseInt(x2), parseInt(y2)]);
  };

  const onSplit = () => {
    console.log("onSplit");
    console.log(actionRef.current);
    const split = document.getElementById("split") as HTMLInputElement;
    const [x, y] = split.value.split(",");
    actionRef.current?.splitCell([parseInt(x), parseInt(y)]);
  };

  const logSelectState = () => {
    console.log(actionRef.current?.getSelectState());
  };

  const logData = () => {
    console.log(actionRef.current?.getTableSize());
    console.log(actionRef.current?.getMergeInfo());
  };
  console.log(CSS);

  return (
    <>
      <h1>Table</h1>
      <div>
        <div>
          <input type="text" id="add_col" />
          <button onClick={onAddCol}>addCol</button>
        </div>

        <div>
          <input type="text" id="add_row" />
          <button onClick={onAddRow}>addRow</button>
        </div>

        <div>
          <input type="text" id="del_col" />
          <button onClick={onDelCol}>delCol</button>
        </div>

        <div>
          <input type="text" id="del_row" />
          <button onClick={onDelRow}>delRow</button>
        </div>

        <div>
          <input type="text" id="merge" />
          <button onClick={onMerge}>merge</button>
        </div>

        <div>
          <input type="text" id="split" />
          <button onClick={onSplit}>split</button>
        </div>

        <button onClick={logSelectState}>selectState</button>

        <button onClick={logData}>logData</button>
      </div>
      <div ref={tableRef}></div>
    </>
  );
}

export default App;
