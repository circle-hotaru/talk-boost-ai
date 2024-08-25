import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { IELTS_SPEAKING_TEST } from '@/constants'

interface OnboardingProps {
  setMessages: Function
  sending: boolean
  setSending: Function
}

const languages = ['English', 'French', 'Japanese', 'Spanish']

const getPrompt = (language: string) => {
  return `You are an ${language} teacher, please help me practice daily ${language} communication. Find interesting topics to chat about and respond in a friendly way. Please keep your answer concise and to the point, trying to be around 2-3 sentences. If I make any mistakes, please point them out and correct them. Please communicate with me in ${language}.`
}

const Onboarding: React.FC<OnboardingProps> = ({
  setMessages,
  sending,
  setSending,
}) => {
  const { t } = useTranslation()
  const onClick = (prompt: string) => {
    setMessages((prevMessages: any[]) => [
      ...prevMessages,
      {
        role: 'user',
        content: prompt,
      },
    ])
    setSending(true)
  }

  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <h1 className='self-center'>Talk Boost AI</h1>
      <div className='flex items-center justify-center gap-2'>
        <Button
          shape='round'
          loading={sending}
          onClick={() => onClick(IELTS_SPEAKING_TEST)}
        >
          {t('mode.IELTS_speaking_test')}
        </Button>
        {languages.map((language, index) => {
          const prompt = getPrompt(language)
          return (
            <Button
              type='primary'
              key={index}
              shape='round'
              loading={sending}
              onClick={() => onClick(prompt)}
            >
              {t(`mode.${language.toLowerCase()}_communication`)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default Onboarding
