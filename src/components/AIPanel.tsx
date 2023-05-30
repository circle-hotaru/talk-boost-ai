import { useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { Button, Divider } from 'antd'
import { getTextToSpeakApi } from '~/apis/newTTS'
import { requestOpenAI } from '~/apis/openai'
import { openVoiceAtom, openAiCount } from '~/state/settings'
import { TRANSLATE_SYSTEM_PROMPT, TRANSLATE_PROMPT } from '~/constants'
import { PlayCircleOutlined, TranslationOutlined } from '@ant-design/icons'

const TTSPanel: React.FC<{
  content: string
  sending: boolean
  enabled: boolean
  index: number
}> = ({ content, sending, enabled, index }) => {
  const [audioSource, setAudioSource] = useState(null)
  const [speak, setSpeak] = useState<boolean>(false)
  const [openSounds, setOpenSounds] = useState<boolean>(false)
  const [speechSynthesizer, setSpeechSynthesizer] = useState<any>({})
  const [aiCount] = useAtom(openAiCount)
  const audioRef = useRef(null)
  const handleSpeak = () => {
    if (!speak) {
      audioSource ? audioRef.current.play() : setOpenSounds(true)
      setSpeak(true)
    } else {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setSpeak(false)
    }
  }

  useEffect(() => {
    if (Object.keys(speechSynthesizer).length === 0) {
      let res = getTextToSpeakApi()
      setSpeechSynthesizer(res)
    }
  }, [speechSynthesizer])
  useEffect(() => {
    if (enabled && aiCount === index) {
      setOpenSounds(true)
    }
  }, [enabled])

  useEffect(() => {
    if (!!content && Object.keys(speechSynthesizer).length > 0 && openSounds) {
      genAudio()
    }
  }, [content, openSounds, speechSynthesizer])

  const genAudio = async () => {
    try {
      speechSynthesizer.speakTextAsync(
        content,
        (result) => {
          const { audioData } = result
          speechSynthesizer.close()
          let blob = new Blob([audioData])
          let urlBlob = URL.createObjectURL(blob)
          setAudioSource(urlBlob)
        },
        (error) => {
          console.log(error)
          speechSynthesizer.close()
        }
      )
    } catch (error) {
      console.error('error', error)
    }
  }

  useEffect(() => {
    if (!!audioSource && sending && enabled) {
      audioRef.current.pause()
    }
  }, [sending])

  return (
    <span className={enabled ? '' : 'w-1'}>
      {enabled && (
        <>
          <audio ref={audioRef} src={audioSource} />

          <Button
            onClick={handleSpeak}
            size="small"
            icon={<PlayCircleOutlined />}
          />
        </>
      )}
    </span>
  )
}

const AIPanel: React.FC<{
  index: number
  content: string
  sending: boolean
}> = ({ content, sending, index }) => {
  const [openVoice] = useAtom(openVoiceAtom)
  const [translating, setTranslating] = useState(false)
  const [translateContent, setTranslateContent] = useState(null)

  const handleTranslate = async () => {
    const translateMessages = [
      {
        role: 'system',
        content: TRANSLATE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `${TRANSLATE_PROMPT}${content}`,
      },
    ]

    setTranslating(true)
    try {
      const data = await requestOpenAI(translateMessages)
      if (data) {
        setTranslateContent(data.choices[0].message.content)
      }
    } catch (error) {
      console.error(error)
    }
    setTranslating(false)
  }

  return (
    <div className="flex flex-col flex-nowrap gap-1">
      <div className="self-start px-4 py-2 rounded-lg bg-slate-50 text-left font-normal text-gray-900">
        <span>{content}</span>
        {translateContent && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <span>{translateContent}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <TTSPanel
          enabled={openVoice}
          index={index}
          content={content}
          sending={sending}
        />
        <Button
          onClick={handleTranslate}
          size="small"
          loading={translating}
          disabled={translating}
          icon={<TranslationOutlined />}
        />
      </div>
    </div>
  )
}

export default AIPanel
