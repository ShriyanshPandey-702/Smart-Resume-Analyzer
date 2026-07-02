import { useState } from "react";
import axios from "axios";

function App() {

    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {

    if (!selectedFile) {
        alert("Please select a resume first.");
        return;
    }

    const formData = new FormData();

    formData.append("resume", selectedFile);

    try {

        const response = await axios.post(
            "http://localhost:5001/api/resume/upload",
            formData
        );

        setResult(response.data);

    } catch (error) {

        console.log(error);

    }

    };

    return (
        <div style={{
            padding: "40px",
            textAlign: "center"
        }}>

            <h1>Smart Resume Analyzer</h1>

            <br />

            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
            />

            <br /><br />

            <p>
                {selectedFile
                    ? selectedFile.name
                    : "No file selected"}
            </p>

            <button onClick={handleUpload}>
                Upload Resume
            </button>

            {result && (
                <div style={{ marginTop: "30px" }}>
                  <h3>Upload Result</h3>

                  <p>
                    <strong>Status:</strong> {result.message}
                  </p>

                  <p>
                    <strong>Original Name:</strong> {result.file.originalName}
                  </p>

                  <p>
                    <strong>Saved Name:</strong> {result.file.savedName}
                  </p>

                  <p>
                    <strong>File Size:</strong> {result.file.size} bytes
                  </p>

                  <p>
                    <strong>Type:</strong> {result.file.type}
                  </p>
                </div>
            )}

        </div>
    );
}

export default App;