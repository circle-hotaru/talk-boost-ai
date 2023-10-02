import { Layout } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom, userInfoModalOpenAtom } from '~/state'

const { Header } = Layout

const Navbar: React.FC = () => {
  const user = window?.localStorage?.getItem('user')

  const [openAuthModal, setOpenAuthModal] = useAtom(authModalOpenAtom)
  const [openUserInfoModal, setOpenUserInfoModal] = useAtom(
    userInfoModalOpenAtom
  )

  const openModal = () => {
    if (!!user) {
      setOpenUserInfoModal(true)
    } else {
      setOpenAuthModal(true)
    }
  }

  return (
    <Header className='z-10 flex h-14 w-full items-center bg-primary/60 px-4 backdrop-blur-sm md:h-16 md:px-8'>
      <button
        onClick={openModal}
        className='shadow-element h-10 w-10 rounded-full bg-white p-1.5 outline-none transition-transform ease-in-out active:scale-90'
      >
        <img src='/images/logo.png' className='h-7 w-7' alt='Open Menu' />
      </button>
    </Header>
  )
}

export default Navbar
