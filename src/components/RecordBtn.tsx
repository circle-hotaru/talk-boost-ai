import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { Button } from 'antd'

interface RecordBtcProps {
  setInput: (input: string) => void
}

const RecordBtn: React.FC<RecordBtcProps> = ({ setInput }) => {
  const { t } = useTranslation()
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const handleRecord = () => {
    if (!browserSupportsSpeechRecognition) {
      console.log("browser doesn't support speech recognition")
      return
    }
    listening
      ? SpeechRecognition.stopListening()
      : SpeechRecognition.startListening()
  }

  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  return (
    <div>
      <Button type="primary" onClick={handleRecord}>
        {listening ? (
          <div className="flex gap-1 items-center">
            <span>{t('in_chat')}</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
        ) : (
          <span>{t('chat')}</span>
        )}
      </Button>
    </div>
  )
}

export default RecordBtn
