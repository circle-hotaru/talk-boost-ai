import Link from 'next/link'

const Footer: React.FC = () => {
  const gradientText = {
    fontWeight: 700,
    background: 'linear-gradient(321deg,#00d1ff,#c059ff 46.3%,#f90)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  }

  return (
    <div className='font-varelaRound mb-4 text-center text-gray-400'>
      <span>Made with</span>
      <span style={gradientText}>&nbsp;Love&nbsp;</span>
      <span>
        by&nbsp;
        <Link className='font-bold' href='https://github.com/circle-hotaru'>
          circlehotarux
        </Link>
      </span>
    </div>
  )
}

export default Footer
