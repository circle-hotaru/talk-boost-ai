import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { Button } from 'antd'
import { openAiCount } from '~/state'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk'

const PlayerBtn: React.FC<{
  content: string
  index: number
}> = ({ content, index }) => {
  const [audio, setAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [aiCount] = useAtom(openAiCount)

  const Icon = isPlaying ? PauseCircleOutlined : PlayCircleOutlined

  const synthesizeSpeech = (text: string) => {
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

  const handlePlay = () => {
    const player = synthesizeSpeech(content)
    setAudio(player)
    setIsPlaying(true)
  }

  const handlePause = () => {
    if (audio) {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const handleClick = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  useEffect(() => {
    if (aiCount === index) {
      handlePlay()
    } else {
      handlePause()
    }
  }, [aiCount])

  return <Button onClick={handleClick} size="small" icon={<Icon />} />
}

export default PlayerBtn
