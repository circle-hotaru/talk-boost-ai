import Link from 'next/link'
import { useTranslation } from 'react-i18next'
// import { ExternalLink } from 'lucide-react'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  return (
    <footer className='flex flex-col items-center gap-2 bg-white py-2 text-sm text-gray-600 shadow-md'>
      {/* <Link
        href='https://tarot.incircle.dev'
        className='flex items-center hover:text-blue-500'
        target='_blank'
      >
        <span>{t('tarot_master_link')}</span>
        <ExternalLink size={16} />
      </Link> */}
      <p className='mt-0'>
        Made with ❤️ by{' '}
        <Link
          href='https://github.com/circle-hotaru'
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-blue-500'
        >
          incircle
        </Link>
      </p>
    </footer>
  )
}

export default Footer
