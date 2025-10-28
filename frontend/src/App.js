import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <header className="App-header">
        <a
          className="App-link"
          href="/nj-business-demo/index.html"
          rel="noopener noreferrer"
        >
          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Emergent" />
        </a>
        <p className="mt-5">Building something incredible ~!</p>
        <p><a className="App-link" href="/nj-business-demo/index.html">Open NJ Business Portal Demo</a></p>
      </header>
    </div>
  );
};

const StaticDemo = () => {
  // Render the static demo inside an iframe to avoid React Router interference
  return (
    <div style={{height: "100vh", width: "100%", margin: 0, padding: 0}}>
      <iframe
        title="NJ Business Portal Demo"
        src="/nj-business-demo/index.html"
        style={{ border: 0, width: "100%", height: "100%" }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

const CatchAll = () => {
  const p = window.location.pathname || "";
  if (p.startsWith("/nj-business-demo")) {
    return <StaticDemo/>;
  }
  return <Home/>;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
