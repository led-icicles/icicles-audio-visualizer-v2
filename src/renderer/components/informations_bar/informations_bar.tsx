import React from "react";
import styled from "styled-components";
import { Animation } from "icicles-animation";
import { MusicAnimation } from "../../utils/music_animation";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
import { usePlayer } from "../../window";

const Container = styled.div`
  height: 100%;
  width: calc(250px - 8px);
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #202020;
  color: #808080;
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
  font-size: 16px;
`;

interface InformationsBarProps {}

export const InformationsBar = (props: InformationsBarProps) => {
  const player = usePlayer();

  return (
    <Container>
      <Title>Informacje</Title>
      {player.currentAnimation && (
        <PerfectScrollbar>
          <>
            <table>
              <tbody>
                <tr>
                  <th>Nazwa:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation!.header.name}</td>
                </tr>
                <tr>
                  <th>Czas trwania:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation.duration / 1000}s</td>
                </tr>
                <tr>
                  <th>Liczba klatek:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation.animationFramesCount}</td>
                </tr>
                <tr>
                  <th>Rozmiar:</th>
                </tr>
                <tr>
                  <td>{(player.currentAnimation.size / 1000).toFixed(2)}KB</td>
                </tr>
                <tr>
                  <th>Pętle:</th>
                </tr>
                <tr>
                  <td>
                    {player.currentAnimation instanceof MusicAnimation
                      ? "Nie dotyczy"
                      : player.currentAnimation.header.loopsCount}
                  </td>
                </tr>
                <tr>
                  <th>Liczba pikseli:</th>
                  <th>x:</th>
                  <th>y:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation.header.pixelsCount}</td>
                  <td>{player.currentAnimation.header.xCount}</td>
                  <td>{player.currentAnimation.header.yCount}</td>
                </tr>
                <tr>
                  <th>Wersja animacji:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation.header.versionNumber}</td>
                </tr>
                <tr>
                  <th>Liczba radio paneli:</th>
                </tr>
                <tr>
                  <td>{player.currentAnimation.header.radioPanelsCount}</td>
                </tr>
              </tbody>
            </table>
          </>
        </PerfectScrollbar>
      )}
    </Container>
  );
};
