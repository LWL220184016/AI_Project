import React, { useState, useEffect, useRef } from 'react';

function Audio_Recoder(props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSoundOverThreshold, setIsSoundOverThreshold] = useState(false);
  // const [dialogues, setDialogues] = useState([]); // 儲存音頻 blob 的 URL
  const [soundThreshold, setSoundThreshold] = useState(0.01);
  const [timeOfCheckIsMergeAudio, setTimeOfCheckIsMergeAudio] = useState(3000);

  // 核心引用
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isSoundOverThresholdRef = useRef(false); // 爲了及時和 setupAudioAnalysis 同步狀態
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const lastBlobRef = useRef(null);
  const soundThresholdRef = useRef(null); // 爲了及時和 setupAudioAnalysis 同步狀態
  const streamRef = useRef(null); // 新增 stream 引用

  // 同步状态到引用
  useEffect(() => { // 爲了及時和 setupAudioAnalysis 同步狀態
    isSoundOverThresholdRef.current = isSoundOverThreshold;
    console.log('IsSoundOverThresholdRef changed', isSoundOverThresholdRef.current);
    if (mediaRecorderRef.current) {
      if (isSoundOverThreshold) {
        mediaRecorderRef.current.start(500);
      } else {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isSoundOverThreshold]);

  useEffect(() => { // 爲了及時和 setupAudioAnalysis 同步狀態
    soundThresholdRef.current = soundThreshold;
  }, [soundThreshold]);

  // 音频分析逻辑
  const setupAudioAnalysis = async (stream) => {
    if (audioContextRef.current) {
      await audioContextRef.current.close();
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;

      for (let i = 0; i < bufferLength; i++) {
        sum += Math.pow(dataArray[i] / 128 - 1, 2);
      }

      const rms = Math.sqrt(sum / bufferLength);
      const isAboveThreshold = rms > soundThresholdRef.current;

      if (isAboveThreshold !== isSoundOverThresholdRef.current) {
        setIsSoundOverThreshold(isAboveThreshold);
      }
      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  };

  // 保存当前音频片段
  const saveCurrentSegment = () => {
    if (audioChunksRef.current.length === 0) return;

    let blob = new Blob(audioChunksRef.current, {
      type: mediaRecorderRef.current?.mimeType || 'audio/webm'
    });
    let url = null;

    //  合併目前 blob 和新 blob，無需寫 code 來清理無用的 blob，
    //  JavaScript 垃圾收集器會在適當的時候處理它們。
      if (null !== lastBlobRef.current && Date.now() - lastBlobRef.current.timestamp < timeOfCheckIsMergeAudio) {
        blob = new Blob([lastBlobRef.current.blob, blob], {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        url = URL.createObjectURL(blob);
        props.setDialogues(prev => [...prev = prev.slice(0, prev.length - 1), {
          userName: 'You',
          userText: 'This is a audio message.',
          userSrc: url,
          botThink: '',
          botText: '',
          timestamp: Date.now(),
          duration: calculateDuration(audioChunksRef.current)
        }]);
        
        props.globalSocket.send(sendPaddedBlob(blob));
        lastBlobRef.current = { blob: blob, timestamp: Date.now() };
    
      } else if(blob.size > 2000) {
        const url = URL.createObjectURL(blob);
        props.setDialogues(prev => [...prev, {
          userName: 'You',
          userText: 'This is a audio message.',
          userSrc: url,
          botThink: '',
          botText: '',
          timestamp: Date.now(),
          duration: calculateDuration(audioChunksRef.current)
        }]);
        
        props.globalSocket.send(sendPaddedBlob(blob));
        lastBlobRef.current = { blob: blob, timestamp: Date.now() };
      }


    audioChunksRef.current = [];
  };

  // for convert the audio data to pyaudio.paInt16 and send to the server
  const sendPaddedBlob = async (blob) => {
    const elementSize = 2; // 根據實際元素大小調整（例如 2 表示 16 位 PCM）
    const buffer = await blob.arrayBuffer();
    const remainder = buffer.byteLength % elementSize;

    if (remainder !== 0) {
      const padding = elementSize - remainder;
      const paddedBuffer = new ArrayBuffer(buffer.byteLength + padding);
      const view = new Uint8Array(paddedBuffer);
      view.set(new Uint8Array(buffer), 0);
      // 填充 0（可根據需要調整填充內容）
      view.fill(0, buffer.byteLength);
      const paddedBlob = new Blob([paddedBuffer], { type: blob.type });
      props.globalSocket.send(paddedBlob);
    } else {
      props.globalSocket.send(blob);
    }
  };

  // 计算音频时长
  const calculateDuration = (chunks) => {
    return chunks.reduce((total, chunk) => total + chunk.size, 0) / 1500;
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 清理旧资源
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupAudioAnalysis(stream);

      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
          ? 'audio/webm; codecs=opus'
          : 'audio/webm'
      };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        saveCurrentSegment();
      };

      setIsRecording(true);
    } catch (error) {
      console.error('录音启动失败:', error);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsSoundOverThreshold(false);
  };

  // 清理资源
  useEffect(() => {
    return () => {
      props.dialogues.forEach(segment => URL.revokeObjectURL(segment.url));
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? '停止录音' : '开始录音'}
      </button>
      <label>聲音閾值：</label>
      <input
        type="number"
        value={soundThreshold}
        onChange={(e) => setSoundThreshold(Number(e.target.value))}
        step={0.01}
        min={0}
        max={1}
      />
      <div>当前状态：{isSoundOverThreshold ? "检测到声音" : "静音中"}</div>
    </div>
  );
}

export default Audio_Recoder;