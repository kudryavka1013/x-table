import XTable from "../../x-table";

function App() {
  return (
    <>
      <h1>Table</h1>
      <div
        ref={(dom) => {
          const table = new XTable(3, 3);
          dom && dom.appendChild(table.getTable().table);
        }}
      ></div>
    </>
  );
}

export default App;
