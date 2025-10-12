import React, { useState } from 'react';

const DialogueCell = (props) => {
  // Convert timestamp to HKT
  const [is_hide_think, setIs_hide_think] = useState(false);

  const convertToHKT = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong', hour12: true });
  };

  return (
    <>
      <hr />
      <div className="dialogue-cell_user">
        <div className="dialogue-cell_speaker">
          {props.userName === undefined ? 'Error display user name' : props.userName}
        </div>
        <div className="dialogue-cell_text">
          {props.userText}
        </div>
        <div className="dialogue-cell_text">
          信息發送時間：{convertToHKT(props.timestamp)}
        </div>
        {props.userSrc === undefined ? (
          <div className="dialogue-cell_audio">
            没有可以播放的音频
          </div>
        ) : (
          <div className="dialogue-cell_audio">
            <audio controls src={props.userSrc}></audio>
          </div>
        )}
      </div>
      <div className="dialogue-cell_bot">
        <div className="dialogue-cell_speaker">
          {props.botName}
        </div>

        {props.botThink === "" ? (<></>) : (
          <div className="dialogue-cell_think" onClick={() => is_hide_think ? setIs_hide_think(false) : setIs_hide_think(true)}>
            <p style={{ color: 'purple', whiteSpace: 'pre-wrap' }} >Press to hide the thinking block</p>
            <p style={{ color: 'green', whiteSpace: 'pre-wrap' }}>{is_hide_think ? "Bot thinking has been hidden" : props.botThink}</p>
            <br />
          </div>
        )}

        <div className="dialogue-cell_text">
          <p style={{ whiteSpace: 'pre-wrap' }}>{props.botText}</p>
          {}
        </div>
        {props.botSrc === undefined ? (
          <div className="dialogue-cell_audio">
            没有可以播放的音频
          </div>
        ) : (
          <div className="dialogue-cell_audio">
            <audio controls src={props.botSrc} ></audio>
          </div>
        )}
      </div>
    </>
  );
};

export default DialogueCell;