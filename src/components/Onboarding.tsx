import { Button } from 'antd'
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
    <div className="flex flex-col justify-center items-center gap-4 h-full">
      <h1 className="self-center">Talk Boost AI</h1>
      <div className="flex justify-center items-center gap-2">
        <Button
          shape="round"
          loading={sending}
          onClick={() => onClick(IELTS_SPEAKING_TEST)}
        >
          🎓 雅思口语陪练 ➡️
        </Button>
        <Button
          type="primary"
          shape="round"
          loading={sending}
          onClick={() => onClick(ENGLISH_TEACHER)}
        >
          😊 日常交流 ➡️
        </Button>
      </div>
    </div>
  )
}

export default Onboarding
