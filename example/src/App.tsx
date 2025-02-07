import { useEffect, useRef } from "react";
import XTable from "@kudryavka1013/x-table";
import "@kudryavka1013/x-table/x-table.css";

function App() {
  const tableRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<XTable>();

  useEffect(() => {
    console.log("useEffect");
    const table = new XTable(3, 3);
    actionRef.current = table;
    tableRef.current?.appendChild(table.getTable().table);
  }, []);

  const onAddCol = () => {
    console.log("onAddCol");
    console.log(actionRef.current);
    actionRef.current?.addColumn(1);
  };

  const onAddRow = () => {
    console.log("onAddRow");
    console.log(actionRef.current);
    actionRef.current?.addRow(1);
  }

  const onDelCol = () => {
    console.log("onDelCol");
    console.log(actionRef.current);
    actionRef.current?.deleteColumn(1);
  }

  const onDelRow = () => {
    console.log("onDelRow");
    console.log(actionRef.current);
    actionRef.current?.deleteRow(1);
  }

  return (
    <>
      <h1>Table</h1>
      <div>
        <button onClick={onAddCol}>addCol</button>
        <button onClick={onAddRow}>addRow</button>
        
        <button onClick={onDelCol}>delCol</button>
        <button onClick={onDelRow}>delRow</button>
      </div>
      <div ref={tableRef}></div>
    </>
  );
}

export default App;
