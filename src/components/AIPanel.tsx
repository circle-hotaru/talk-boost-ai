import { useState } from 'react'
import { useAtom } from 'jotai'
import { Button, Divider } from 'antd'
import { requestOpenAI } from '~/apis/openai'
import { openVoiceAtom } from '~/state'
import { TRANSLATE_SYSTEM_PROMPT, TRANSLATE_PROMPT } from '~/constants'
import { TranslationOutlined } from '@ant-design/icons'
import PlayerBtn from './PlayerBtn'

const AIPanel: React.FC<{
  index: number
  content: string
  sending: boolean
}> = ({ content, index }) => {
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
        {openVoice && <PlayerBtn index={index} content={content} />}
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
