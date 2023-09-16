import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'

const getSpeakToTextApi = () => {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
  return recognizer
}
const getTextToSpeakApi = () => {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  const speechSynthesizer = new SpeechSynthesizer(speechConfig)
  return speechSynthesizer
}

export { getSpeakToTextApi, getTextToSpeakApi }
