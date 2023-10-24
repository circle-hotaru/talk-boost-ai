import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <div className='text-center text-gray-400'>
      <p>
        Made with ❤️ by{' '}
        <Link className='font-bold' href='https://github.com/circle-hotaru'>
          circlehotarux
        </Link>{' '}
        on{' '}
        <Link
          className='font-bold'
          href='https://github.com/circle-hotaru/talk-boost-ai'
        >
          GitHub
        </Link>
      </p>
    </div>
  )
}

export default Footer
