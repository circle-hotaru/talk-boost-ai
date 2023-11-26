import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk'

export const getSpeakToTextApi = () => {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
  return recognizer
}

export const azureSpeechSynthesize = (
  text: string,
  voiceId: string,
  setIsPlaying: (isPlaying) => void
) => {
  const speechConfig = speechSDK.SpeechConfig.fromSubscription(
    process.env.AZURE_SECRET,
    process.env.AZURE_REGION
  )
  speechConfig.speechSynthesisVoiceName = voiceId
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
