import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./index.css";

import "preline";


import {
AuthProvider
}
from "./context/AuthContext";


import {
ThemeProvider
}
from "./context/ThemeContext";


import {
AppWrapper
}
from "./components/common/PageMeta.tsx";





ReactDOM.createRoot(
document.getElementById("root")
)
.render(


<React.StrictMode>


<ThemeProvider>


<AppWrapper>


<AuthProvider>


<App/>


</AuthProvider>


</AppWrapper>


</ThemeProvider>


</React.StrictMode>


);