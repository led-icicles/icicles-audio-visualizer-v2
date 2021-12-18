import React from "react";
import { useCallback } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import styled from "styled-components";

export type OnDropFunction = (
  acceptedFiles: Array<File>,
  fileRejections: Array<FileRejection>,
  event: DropEvent
) => void;

const Container = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export interface DropzoneProps {
  addFile: (file: File) => void;
}

export const Dropzone = ({ addFile }: DropzoneProps) => {
  const onDrop = useCallback<OnDropFunction>(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        addFile(acceptedFiles[0]);
      }
    },
    [addFile]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: [".anim"],
  });

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Upuść plik...</p>
      ) : (
        <p>Upuść tutaj, lub kliknij by wybrać pliki animacji</p>
      )}
    </Container>
  );
};
