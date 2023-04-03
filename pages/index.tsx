import Head from 'next/head'
import type { NextPage } from 'next'
import Content from '~/components/Content'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>TalkBoost</title>
        <meta
          name="description"
          content="TalkBoost is a free and open-source web project that helps you practice your spoken language skills and improve your speaking ability using ChatGPT."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to TalkBoost</h1>
        <Content />
      </main>
    </div>
  )
}

export default Home
