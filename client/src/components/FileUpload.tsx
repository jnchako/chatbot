import { useState } from "react";

function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one document.");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      setMessage("Uploading...");

      const response = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setMessage(data.message);

      console.log("Uploaded documents:", data.files);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <div>
      <h2>Upload Documents</h2>

      <input
        type="file"
        multiple
        accept=".pdf,.txt,.md"
        onChange={handleFileChange}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      {files.length > 0 && (
        <div>
          <h3>Selected Documents</h3>

          <ul>
            {files.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default FileUpload;