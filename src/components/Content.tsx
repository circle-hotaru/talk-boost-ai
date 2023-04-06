import { useEffect, useState, KeyboardEventHandler } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { sendRequest } from '~/apis/openai';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';

const Content = () => {
  const [sendFlag, setSendFlag] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [response, setResponse] = useState<string>('');
  const [recordFlag, setRecordFlag] = useState<boolean>(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();
  if (!browserSupportsSpeechRecognition) {
    console.log("Browser doesn't support speech recognition.");
  }

  const handleSend = () => {
    const input_json = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, input_json]);
    console.log('11111input', input_json);
    setInput('');
    setSendFlag(!sendFlag);
  };

  const handleRecord = () => {
    if (!recordFlag) {
      SpeechRecognition.startListening();
    } else {
      SpeechRecognition.stopListening();
      setInput(transcript);
    }
    setRecordFlag(!recordFlag);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (input.length === 0) return;
      handleSend();
    } else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setInput(input + '\n');
    }
  };
  const handleReturns = () => {
    if (response) {
      speak({ text: response });
    } else {
      speak({ text: 'Please start chatting with me' });
    }
  };
  useEffect(() => {
    if (response.length !== 0 && response !== 'undefined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ]);
      setTimeout(() => {
        speak({ text: response });
      }, 1000);
    }
  }, [response]);

  useEffect(() => {
    if (messages.length > 0) {
      let messagesToSent = messages;
      messagesToSent.unshift({
        role: 'system',
        content:
          'You are an English teacher, please help me practice daily English communication. If I make any mistakes, please point them out and correct them.',
      });
      sendRequest(messagesToSent, (data: any) => {
        if (data) {
          setResponse(data.choices[0].message.content);
          console.log('Response: ' + data.choices[0].message.content);
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }, [sendFlag]);

  useEffect(() => {
    if (!listening) {
      SpeechRecognition.stopListening();
      setInput(transcript);
      setRecordFlag(!recordFlag);
    }
  }, [listening]);

  return (
    <div className="w-full max-w-3xl flex flex-1 flex-col justify-end items-center mt-4">
      <div className="flex-1">
        {messages
          .filter((message) => message.role !== 'system')
          .map(({ role, content }, index) => (
            <p key={index}>{`${role}: ${content}`}</p>
          ))}
      </div>
      <div className="w-full flex items-center gap-2 mx-auto">
        <TextareaAutosize
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={10}
          placeholder="Type your message here..."
          className="grow px-3 py-2 bg-gray-100 rounded-lg resize-none text-neutral-500"
        />
        <button
          onClick={handleRecord}
          className="border-2 font-bold py-2 px-4 rounded-lg"
        >
          {listening ? <span>🎙️</span> : <span>🛑</span>}
        </button>
        <button
          onClick={handleSend}
          className="border-2 font-bold py-2 px-4 rounded-lg"
        >
          Send
        </button>
        <button
          onClick={handleReturns}
          className="border-2 font-bold py-2 px-4 rounded-lg"
        >
          Returns
        </button>
      </div>
    </div>
  );
};

export default Content;
