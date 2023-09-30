import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom } from '~/state'
import RegisterForm from './User/RegisterForm'
import LoginForm from './User/LoginForm'

const AuthModal: React.FC = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useAtom(authModalOpenAtom)
  const [isRegister, setIsRegister] = useState(true)

  return (
    <Modal
      title={isRegister ? t('register') : t('login')}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      closeIcon={false}
    >
      {isRegister ? (
        <RegisterForm toLogin={() => setIsRegister(false)} />
      ) : (
        <LoginForm toRegister={() => setIsRegister(true)} />
      )}
    </Modal>
  )
}

export default AuthModal
