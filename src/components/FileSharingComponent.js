import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const FileSharingComponent = () => {
  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [fileName, setFileName] = useState("");

  const Url = "https://crudapp-ldw7.onrender.com";

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
        const currentTime = Date.now();
      const response = await axios.get(`${Url}/api/files`, {
        params: { currentTime }
      });
      setFiles(response.data.slice(0, 10)); // Limit to the first 5 files
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles(); // Fetch files on component mount
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (!fileInput) {
      return;
    }

    if (files.length >= 10) {
      alert("You can only upload up to 10 files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("fileName", fileName || fileInput.name); // Use the selected file name if no custom name is provided

    try {
        const currentTime = Date.now();
      await axios.post("/api/upload", formData, {
        params: { currentTime },
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileInput(null);
      setFileName("");
      fetchFiles(); // Refresh file list
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Handle file download
  const handleDownload = async (fileName) => {
    try {
        const currentTime = Date.now();
      const response = await axios.get(`${Url}/api/download/${fileName}`, {
        params: { currentTime },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Set the downloaded file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Handle file deletion
  const handleDelete = async (fileName) => {
    try {
        const currentTime = Date.now();
      await axios.delete(`${Url}/api/files/${fileName}`, {
        params: { currentTime },
      });
      fetchFiles(); // Refresh file list
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="container mt-3">
      <h3>File Sharing</h3>
      <div className="upload-section mb-4">
        <input
          type="file"
          onChange={(e) => setFileInput(e.target.files[0])}
          className="form-control mb-2"
        />
        <button className="btn btn-secondary" onClick={handleUpload}>
          Upload File
        </button>
      </div>

      <div className="file-list-section">
        <h5>Files</h5>
        {files.length > 0 ? (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {file}
                <div>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(file)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No files available.</p>
        )}
      </div>
    </div>
  );
};

export default FileSharingComponent;
