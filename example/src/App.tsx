import { useEffect, useRef } from "react";
import XTable from '../../packages/x-table/src/index';

function App() {
  const tableRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<XTable>();

  useEffect(() => {
    console.log("useEffect"); 
    const table = new XTable(3, 3);
    actionRef.current = table;
    tableRef.current?.appendChild(table.getTable().table);
  }, []);

  const onClick = () => {
    console.log("click");
    console.log(actionRef.current);
    actionRef.current?.addCol(2);
  };

  return (
    <>
      <h1 onClick={onClick}>Table</h1>
      <div ref={tableRef}></div>
    </>
  );
}

export default App;
