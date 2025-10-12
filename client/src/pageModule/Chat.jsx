import React, { useState, useEffect, useRef, useCallback } from 'react';
import DialogueCell from './dialogue_cell.jsx';
import Audio_Recoder from './audio_record.jsx';
import { audioBufferToWav } from '../util/audioUtils';

let globalSocket = null;

function Chat() {
  const [message, setMessage] = useState('');
  const [dialogues, setDialogues] = useState([]);
  const [wsStatus, setWsStatus] = useState('Disconnected');
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const mergedAudioBuffer = useRef(null);
  const audioBufferQueue = useRef([]);
  const is_llm_speaking = useRef(null);
  const is_llm_thinking = useRef(null);

  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  let currentSource = null;
  const wsUrl = process.env.WS_BASE_URL;
  console.log('wsUrl: ', wsUrl);

  // 事件处理函数使用 useCallback 包裹以保持引用稳定
  // 处理服务端返回的消息
  const handleMessage = useCallback((event) => {
    const response = event.data;
    if (response === '') return;

    if (response.startsWith('You: ')) {
      setDialogues((prev) => {
        const lastDialogue = prev[prev.length - 1];
        return [
          ...prev.slice(0, prev.length - 1),
          {
            ...lastDialogue, // 保留最后一条的其他数据
            botName: 'Bot',
            userText: response.slice(5),
          },
        ];
      });

    } else if (response.startsWith('LLM: ')) {
      console.log('LLM: ', response.slice(5));
      if (response.includes("<think>")) {
        is_llm_thinking.current = true;
        console.log('LLM is thinking');

      } else if (response.includes("</think>")) {
        is_llm_thinking.current = false;
        console.log('LLM is stop thinking');
      }

      if (is_llm_thinking.current || response.includes("</think>")) {
        setDialogues((prev) => {
          const lastDialogue = prev[prev.length - 1];
          return [
            ...prev.slice(0, prev.length - 1),
            {
              ...lastDialogue, // 保留最后一条的其他数据
              botName: 'Bot',
              botThink: lastDialogue.botThink + response.slice(5),
            },
          ];
        });
      } else {
        setDialogues((prev) => {
          const lastDialogue = prev[prev.length - 1];
          return [
            ...prev.slice(0, prev.length - 1),
            {
              ...lastDialogue, // 保留最后一条的其他数据
              botName: 'Bot',
              botText: lastDialogue.botText + response.slice(5),
            },
          ];
        });
      }

    } else if (response.startsWith('AUDIO: ')) {
      // 使用示例
      const base64Data = response.slice(7);
      handleAudioSegment(base64Data);
    }
  }, []);

  const handleOpen = useCallback(() => {
    console.log('Connected');
    setWsStatus('Connected');
    reconnectAttempts.current = 0;
  }, []);

  const handleClose = useCallback((e) => {
    setWsStatus('Disconnected');
    scheduleReconnect();
  }, []);

  const handleError = useCallback((error) => {
    console.error('WebSocket error:', error);
    globalSocket.close();
  }, []);

  // 重连逻辑
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= 5) {
      return;
    }

    const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
    reconnectTimer.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      setWsStatus(`Reconnecting (attempt ${reconnectAttempts.current})...`);
      connect();
    }, delay);
  }, []);

  // 连接逻辑
  const connect = useCallback(() => {
    if (globalSocket) {
      globalSocket.close();
    }
    // 创建新连接
    globalSocket = new WebSocket('ws://localhost:6789');
    // globalSocket = new WebSocket(wsUrl);
    globalSocket.addEventListener('open', handleOpen);
    globalSocket.addEventListener('message', handleMessage);
    globalSocket.addEventListener('close', handleClose);
    globalSocket.addEventListener('error', handleError);

  }, [handleOpen, handleMessage, handleClose, handleError]);

  // 初始化连接和清理
  useEffect(() => {
    connect();
    return () => {
      // 卸载时移除事件监听器，关闭连接
      if (globalSocket) {
        globalSocket.removeEventListener('open', handleOpen);
        globalSocket.removeEventListener('message', handleMessage);
        globalSocket.removeEventListener('close', handleClose);
        globalSocket.removeEventListener('error', handleError);
        globalSocket.close();

        if (dialogues) {
          dialogues.forEach((dialogue) => {
            const url = dialogue.url;
            if (url) URL.revokeObjectURL(url);
          });
        }
      }
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect, handleOpen, handleMessage, handleClose, handleError]);

  // 发送消息
  const send_msg = (msg) => {
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      globalSocket.send(msg);
      setDialogues((prev) => [...prev, {
        userName: 'You',
        userText: msg,
        botThink: '',
        botText: '',
        timestamp: Date.now(),
      }]);
    } else {
      console.warn('WebSocket not connected');
      setDialogues((prev) => [...prev, {
        userName: 'You',
        userText: msg,
        timestamp: Date.now(),
        botName: 'system',
        botText: 'Connection closed, please reload.',
      }]);
    }
  };
  useEffect(() => {
    mergedAudioBuffer.current = null;
    is_llm_thinking.current = false;
  }, [dialogues.length]);

  function playAudio(buffer) {
    currentSource = audioContext.current.createBufferSource();
    currentSource.buffer = buffer;
    currentSource.connect(audioContext.current.destination);

    currentSource.onended = () => {
      is_llm_speaking.current = false;
      playNext();
    };

    currentSource.start();
    is_llm_speaking.current = true;
  }

  function playNext() {
    if (audioBufferQueue.current.length > 0) {
      const nextBuffer = audioBufferQueue.current.shift();
      playAudio(nextBuffer);
    }
  }

  // 处理接收到的音频段
  function mergeAudioBuffers(buffer1, buffer2) {
    // 取最小的 channel 數 (一般都相同)
    const numberOfChannels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels);
    // 計算合併後總長度 (以樣本 count 為單位)
    const tmpBuffer = audioContext.current.createBuffer(
      numberOfChannels,
      buffer1.length + buffer2.length,
      buffer1.sampleRate
    );
    // 對每個 channel，先寫入 buffer1，再接上 buffer2
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = tmpBuffer.getChannelData(channel);
      channelData.set(buffer1.getChannelData(channel), 0);
      channelData.set(buffer2.getChannelData(channel), buffer1.length);
    }
    return tmpBuffer;
  }

  function handleAudioSegment(base64Data) {
    // 將 base64 字串轉換成二進位資料
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 使用 promise 版本的 decodeAudioData
    audioContext.current.decodeAudioData(bytes.buffer)
      .then((newBuffer) => {
        // 如果之前尚未合併過，則直接將 newBuffer 指派給 mergedAudioBuffer，
        // 否則合併目前的 mergedAudioBuffer.current 與新解碼的 newBuffer
        if (mergedAudioBuffer.current === null) {
          mergedAudioBuffer.current = newBuffer;
        } else {
          mergedAudioBuffer.current = mergeAudioBuffers(mergedAudioBuffer.current, newBuffer);
        }

        // 撥放或佇列處理
        if (!is_llm_speaking.current) {
          playAudio(newBuffer);
        } else {
          audioBufferQueue.current.push(newBuffer);
        }

        // 將 AudioBuffer 轉換成 WAV 格式，再建立 Blob URL
        const wavBuffer = audioBufferToWav(mergedAudioBuffer.current);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        // 更新對話列表的音頻 blob url
        setDialogues((prev) => {
          const lastDialogue = prev[prev.length - 1];
          return [
            ...prev.slice(0, prev.length - 1),
            {
              ...lastDialogue, // 保留最后一条的其他数据
              botSrc: url,
            },
          ];
        });
      })
      .catch((error) => {
        console.error("解碼音訊資料失敗:", error);
        // 出现错误时，重新初始化 AudioContext 以恢复工作
        audioContext.current.close().catch(() => { });
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      });
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minHeight: '100vh' }}>
      <h1>Chat</h1>
      <div>
        {dialogues.map((dialogue, index) => (
          <React.Fragment key={index}>
            <DialogueCell
              userName={dialogue.userName}
              userText={dialogue.userText}
              timestamp={dialogue.timestamp}
              userSrc={dialogue.userSrc}
              botName={dialogue.botName}
              botThink={dialogue.botThink}
              botText={dialogue.botText}
              botSrc={dialogue.botSrc}
            />
          </React.Fragment>
        ))}
      </div>
      <input type="text" onChange={(e) => setMessage(e.target.value)} />
      <button onClick={() => send_msg(message)}>Send</button>
      <button onClick={() => send_msg('Hello Server!')}>Send Hello</button>
      還要改的：增加緩存，提前保存一部分音頻，因爲人説話音量是從低到高，不加緩存會丟失前面的信息
      添加限制，禁止用戶頻繁發送文字信息，比如每秒一次
      當用戶發送新的信息，終止當前的音頻播放
      <Audio_Recoder dialogues={dialogues} setDialogues={setDialogues} globalSocket={globalSocket} />
      <p>Status: {wsStatus}</p>
      <p>Bot status: {is_llm_speaking.current ? 'Speaking' : 'Listening'}</p>

    </div>
  );
}

export default Chat;