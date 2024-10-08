import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { Modal, Button } from 'antd'
import { userInfoModalOpenAtom } from '@/state'
import Avvvatars from 'avvvatars-react'

const UserInfo: React.FC = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useAtom(userInfoModalOpenAtom)

  const user = JSON.parse(window.localStorage.getItem('user') ?? '{}')

  const handleLogout = async () => {
    window.localStorage.removeItem('user')
    try {
      await fetch('/api/user/logout', {
        method: 'GET',
      })
    } catch (error) {
      console.error('failed to logout', error)
    }
    setOpen(false)
  }

  return (
    <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
      <div className='flex flex-col items-center gap-2'>
        <Avvvatars value={user?.name} style='shape' />
        <p className='m-0'>{user?.name}</p>
        <p className='m-0'>{user?.email}</p>
        <Button type='primary' onClick={handleLogout}>
          {t('logout')}
        </Button>
      </div>
    </Modal>
  )
}

export default UserInfo
