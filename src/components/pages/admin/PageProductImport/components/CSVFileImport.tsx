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
    console.log("uploadFile to", url);
    let response: any;
    //Get the presigned URL
    try{
       response = await axios({
        method: "GET",
        headers: {
          Authorization: `Basic ${window.btoa(localStorage.getItem("authorization_token") || " ")}`,
        },
        url,
        params: {
          name: encodeURIComponent(file!.name),
        }
      });
    }catch(err:any){
      if(err.response.status == 403 || err.response.status == 401){
        alert("You are not authorized")
      }
    }
    console.log('response: ', response)
    console.log("File to upload: ", file!.name);
    console.log("Uploading to: ", response.data);
    const result = await fetch(response.data.PreSignedUrl, {
      method: "PUT",
      body: file,
    });
    console.log("Result: ", result);
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
