import type { NextPage } from 'next'
import { Layout } from 'antd'
import AuthModal from '~/components/AuthModal'
import Footer from '~/components/Footer'
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
    <Layout className='h-screen bg-primary'>
      <DynamicNavbar />
      <Content className='flex h-screen w-full flex-1 flex-row items-center justify-center p-4 pt-0 md:pb-8'>
        <PageContent />
        <AuthModal />
        <DynamicUserInfo />
      </Content>
      <Footer />
    </Layout>
  )
}

export default Home
