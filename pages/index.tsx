import type { NextPage } from 'next'
import { Layout } from 'antd'
import AuthModal from '~/components/AuthModal'
import dynamic from 'next/dynamic'
const PageContent = dynamic(() => import('~/components/Content'), {
  ssr: false,
})
const DynamicNavbar = dynamic(() => import('~/components/Navbar'), {
  ssr: false,
})
const DynamicUserInfo = dynamic(() => import('~/components/User/UserInfo'), {
  ssr: false,
})

const { Content } = Layout

const Home: NextPage = () => {
  return (
    <Layout className="h-screen bg-[#efede7]">
      <DynamicNavbar />
      <Content className="p-4 md:py-8 flex flex-col items-center">
        <PageContent />
        <AuthModal />
        <DynamicUserInfo />
      </Content>
    </Layout>
  )
}

export default Home
