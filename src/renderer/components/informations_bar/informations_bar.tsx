import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { OnDropFunction } from "../dropzone/dropzone";
import { Animation } from "icicles-animation";

const Container = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d3747;
  color: #67788a;
  justify-content: start;

  & > table {
    margin: 8px;
    font-size: 14px;
  }

  & tr > th {
    font-size: 12px;
    font-weight: normal;
    padding: 0;
    text-align: left;
    padding: 8px 0 0 0;
  }
  & tr > td {
    font-size: 14px;
    font-weight: bold;
  }
`;

const Title = styled.p`
  text-align: center;
  font-size: 18px;
`;

const Tile = styled.div`
  margin: 8px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
  text-overflow: ellipsis;
  max-lines: 1;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

interface InformationsBarProps {
  animation: Animation | undefined;
  addFile: (file: File) => void;
}

export const InformationsBar = (props: InformationsBarProps) => {
  const addFile = props.addFile;
  const onDrop = useCallback<OnDropFunction>(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        addFile(acceptedFiles[0]);
      }
    },
    [addFile]
  );
  const { open, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: [".anim", ".mp3"],
  });

  return (
    <Container>
      <input {...getInputProps()} />
      <Title>Sople</Title>
      <Tile onClick={() => open()}>Otwórz plik</Tile>
      {props.animation && (
        <>
          <table>
            <tbody>
              <tr>
                <th>Nazwa:</th>
              </tr>
              <tr>
                <td>{props.animation.header.name}</td>
              </tr>
              <tr>
                <th>Czas trwania:</th>
              </tr>
              <tr>
                <td>{props.animation.duration / 1000}s</td>
              </tr>
              <tr>
                <th>Liczba klatek:</th>
              </tr>
              <tr>
                <td>{props.animation.frames.length}</td>
              </tr>
              <tr>
                <th>Rozmiar:</th>
              </tr>
              <tr>
                <td>{(props.animation.size / 1000).toFixed(2)}KB</td>
              </tr>
              <tr>
                <th>Pętle:</th>
              </tr>
              <tr>
                <td>{props.animation.header.loopsCount}</td>
              </tr>
              <tr>
                <th>Liczba pikseli:</th>
                <th>x:</th>
                <th>y:</th>
              </tr>
              <tr>
                <td>{props.animation.header.pixelsCount}</td>
                <td>{props.animation.header.xCount}</td>
                <td>{props.animation.header.yCount}</td>
              </tr>
              <tr>
                <th>Wersja animacji:</th>
              </tr>
              <tr>
                <td>{props.animation.header.versionNumber}</td>
              </tr>
              <tr>
                <th>Liczba radio paneli:</th>
              </tr>
              <tr>
                <td>{props.animation.header.radioPanelsCount}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </Container>
  );
};
