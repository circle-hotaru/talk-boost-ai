import { useState } from 'react'
import { Modal } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom } from '~/state'
import RegisterForm from './User/RegisterForm'
import LoginForm from './User/LoginForm'

const AuthModal: React.FC = () => {
  const [open, setOpen] = useAtom(authModalOpenAtom)
  const [isRegister, setIsRegister] = useState(true)

  return (
    <Modal
      title={isRegister ? '注册' : '登录'}
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
