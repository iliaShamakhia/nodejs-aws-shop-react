import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    let authToken = localStorage.getItem("authorization_token");
    let response: any;
    //Get the presigned URL
    try{
       response = await axios({
        method: "GET",
        headers: authToken ? { Authorization: `Basic ${window.btoa(authToken)}` } : {},
        url,
        params: {
          name: encodeURIComponent(file!.name),
        }
      });
    }catch(err:any){
      let statusCode = err.response.status;
      if(statusCode == 403){
        alert(`Error: ${statusCode}, You are not authorized`)
      }
      if(statusCode == 401){
        alert(`Error: ${statusCode}, Authorization token is missing`)
      }
    }
    const result = await fetch(response.data.PreSignedUrl, {
      method: "PUT",
      body: file,
    });
    setFile(undefined);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
