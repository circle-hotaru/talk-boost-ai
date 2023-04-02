import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Configuration, OpenAIApi } from 'openai'
import styles from '../styles/Home.module.css'

interface HomeProps {
  literal: string
}

const Home: React.FC<HomeProps> = ({ literal }) => {
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
        <p>{literal}</p>
      </main>
    </div>
  )
}

export default Home

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const incantation = 'how is going on'
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: incantation }],
    })
    const result = completion.data.choices[0].message?.content
    return {
      props: {
        literal: result ?? '~',
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        literal: 'something went wrong',
      },
    }
  }
}
