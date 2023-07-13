// import logo from './logo.svg';
// import './App.css';
import { Routes, Route, } from "react-router-dom";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
function App() {
  // const location = useLocation();
  // const { pathname } = useLocation();

  console.log("*******");
  return (
    // <div className="App">
    //   {/* <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header> */}
    //   <div>Hi I am Durgaswamy</div>
    // </div>
    <>
    <Routes >
      <Route exact path={'/'} element={<Home />} key={'home'} />
      <Route exact path={'/questions'} element={<Questions />} key={'questions'} />

    </Routes>
    </>

    
  );
}

export default App;
