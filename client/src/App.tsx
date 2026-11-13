import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import SearchDocuments from "./components/SearchDocuments";

function App() {
  const [backendStatus, setBackendStatus] =
    useState<string>("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus(data.status);
      })
      .catch(() => {
        setBackendStatus("Backend connection failed");
      });
  }, []);

  return (
    <div>
      <h1>Document RAG Chatbot</h1>

      <p>Backend status: {backendStatus}</p>

      <hr />

      <FileUpload />

      <hr />

      <SearchDocuments />
    </div>
  );
}

export default App;