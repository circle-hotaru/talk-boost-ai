import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { ENGLISH_TEACHER, IELTS_SPEAKING_TEST } from '~/constants'

interface OnboardingProps {
  setMessages: Function
  sending: boolean
  setSending: Function
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
        <Button
          type='primary'
          shape='round'
          loading={sending}
          onClick={() => onClick(ENGLISH_TEACHER)}
        >
          {t('mode.daily_communication')}
        </Button>
      </div>
    </div>
  )
}

export default Onboarding
