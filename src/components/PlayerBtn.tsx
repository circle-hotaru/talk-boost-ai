import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { Button } from 'antd'
import { openAiCount, voiceIdAtom } from '~/state'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { azureSpeechSynthesize } from '~/apis/azureTTS'
import { isSafari } from 'react-device-detect'

const PlayerBtn: React.FC<{
  content: string
  index: number
}> = ({ content, index }) => {
  const [audio, setAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [aiCount] = useAtom(openAiCount)
  const [voiceId] = useAtom(voiceIdAtom)

  const Icon = isPlaying ? PauseCircleOutlined : PlayCircleOutlined

  const handlePlay = () => {
    const player = azureSpeechSynthesize(content, voiceId, setIsPlaying)
    setAudio(player)
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
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    if (aiCount === index) {
      handlePlay()
      if (!isSafari) {
        setIsPlaying(true)
      }
    } else {
      handlePause()
    }
  }, [aiCount])

  return <Button onClick={handleClick} size='small' icon={<Icon />} />
}

export default PlayerBtn
