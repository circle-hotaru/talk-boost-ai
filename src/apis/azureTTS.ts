import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk'
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk'

export const azureSpeechToText = () => {
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY,
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
  )
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
  return recognizer
}

export const azureSynthesizeSpeech = (
  text: string,
  voiceId = 'en-US-AvaMultilingualNeural'
): speechSDK.SpeakerAudioDestination => {
  const speechConfig = speechSDK.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY,
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
  )
  speechConfig.speechSynthesisVoiceName = voiceId
  const player = new speechSDK.SpeakerAudioDestination()
  const audioConfig = speechSDK.AudioConfig.fromSpeakerOutput(player)
  const speechSynthesizer = new speechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig
  )
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
