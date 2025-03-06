import "./App.css";
import Paths from "./paths";
import { ToastContainer, Bounce } from "react-toastify";

function App() {
  return (
    <div className="App">
      <Paths />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        style={{
          fontFamily: "system-ui, Segoe UI, sans-serif, color-emoji",
          fontSize: "13.5px",
        }}
      />
    </div>
  );
}

export default App;
