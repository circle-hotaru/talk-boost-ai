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
    <Header className="fixed w-full top-0 left-0 flex items-center bg-[#efede7]/60 backdrop-blur-sm z-10">
      <button
        onClick={openModal}
        className="w-10 h-10 bg-white rounded-full p-1.5 shadow-element transition-transform ease-in-out active:scale-90 outline-none"
      >
        <img src="/images/logo.png" className="w-7 h-7" alt="Open Menu" />
      </button>
    </Header>
  )
}

export default Navbar
