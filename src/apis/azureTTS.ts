import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk'

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

const azureSpeechSynthesize = (
  text: string,
  setIsPlaying: (isPlaying) => void
) => {
  const speechConfig = speechSDK.SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  const player = new speechSDK.SpeakerAudioDestination()
  const audioConfig = speechSDK.AudioConfig.fromSpeakerOutput(player)
  const speechSynthesizer = new speechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig
  )
  player.onAudioEnd = () => {
    setIsPlaying(false)
  }
  speechSynthesizer.speakTextAsync(
    text,
    (result) => {
      speechSynthesizer.close()
    },
    (error) => {
      console.log(error)
      speechSynthesizer.close()
    }
  )
  return player
}

export { getSpeakToTextApi, getTextToSpeakApi, azureSpeechSynthesize }
