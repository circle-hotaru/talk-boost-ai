import Link from 'next/link'

const Footer: React.FC = () => {
  const gradientText = {
    fontWeight: 700,
    background: 'linear-gradient(321deg,#00d1ff,#c059ff 46.3%,#f90)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  return (
    <div className='mb-4 flex flex-col items-center gap-2 text-center font-varelaRound text-gray-400'>
      <div className='flex gap-2'>
        <Link href='https://t.me/+mPxP1epGxgI0MmI1' target='_blank'>
          Telegram
        </Link>
        <Link href='https://ko-fi.com/incircle' target='_blank'>
          Ko-Fi
        </Link>
      </div>
      <div>
        <span>Made with</span>
        <span style={gradientText}>&nbsp;Love&nbsp;</span>
        <span>
          by&nbsp;
          <Link
            className='font-bold'
            href='https://github.com/circle-hotaru'
            target='_blank'
          >
            circlehotarux
          </Link>
        </span>
      </div>
    </div>
  )
}

export default Footer
