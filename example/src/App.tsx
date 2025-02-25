import { useEffect, useRef } from "react";
import XTable from "@kudryavka1013/x-table";
import "@kudryavka1013/x-table/x-table.css";
import { CSS } from "@kudryavka1013/x-table";

function App() {
  const tableRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<XTable>();

  useEffect(() => {
    console.log("useEffect");
    const table = new XTable([], 3, 3);
    actionRef.current = table;
    tableRef.current?.appendChild(table.getTable().table);
  }, []);

  const onAddCol = () => {
    console.log("onAddCol");
    console.log(actionRef.current);
    actionRef.current?.addColumn(5);
  };

  const onAddRow = () => {
    console.log("onAddRow");
    console.log(actionRef.current);
    actionRef.current?.addRow(5);
  };

  const onDelCol = () => {
    console.log("onDelCol");
    console.log(actionRef.current);
    actionRef.current?.deleteColumn(2);
  };

  const onDelRow = () => {
    console.log("onDelRow");
    console.log(actionRef.current);
    actionRef.current?.deleteRow(2);
  };

  const onMerge = () => {
    console.log("onMerge");
    console.log(actionRef.current);
    actionRef.current?.mergeCells([1, 1], [2, 3]);
  };

  const onSplit = () => {
    console.log("onSplit");
    console.log(actionRef.current);
    actionRef.current?.splitCell([1, 1]);
  };

  const logData = () => {
    console.log(actionRef.current?.getTableSize());
    console.log(actionRef.current?.getMergeInfo());
  }
  console.log(CSS);

  return (
    <>
      <h1>Table</h1>
      <div>
        <button onClick={onAddCol}>addCol</button>
        <button onClick={onAddRow}>addRow</button>

        <button onClick={onDelCol}>delCol</button>
        <button onClick={onDelRow}>delRow</button>

        <button onClick={onMerge}>merge</button>
        <button onClick={onSplit}>split</button>

        <button onClick={logData}>logData</button>
      </div>
      <div ref={tableRef}></div>
    </>
  );
}

export default App;
