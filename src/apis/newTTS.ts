import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
} from 'microsoft-cognitiveservices-speech-sdk'
import { useState } from 'react'

const getSpeakToTextApi = () => {
  const speechConfig = SpeechConfig.fromSubscription(AZURE_SECRET, AZURE_REGION)
  console.log('speechConfig', speechConfig)
  const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig)
  return recognizer
}
const getTextToSpeakApi = () => {
  const speechConfig = SpeechConfig.fromSubscription(AZURE_SECRET, AZURE_REGION)
  const speechSynthesizer = new SpeechSynthesizer(speechConfig)
  return speechSynthesizer
}

export { getSpeakToTextApi, getTextToSpeakApi }
