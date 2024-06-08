import ReactMarkdown from 'react-markdown'
import Avvvatars from 'avvvatars-react'
import { isMobile } from 'react-device-detect'

const UserPanel: React.FC<{ content: string }> = ({ content }) => {
  const user = JSON.parse(window.localStorage.getItem('user') ?? '{}')

  return (
    <div className='flex justify-end gap-1'>
      <ReactMarkdown
        className={
          'rounded-lg bg-blue-400 px-3 py-2 text-right font-normal text-slate-50'
        }
      >
        {content}
      </ReactMarkdown>
      <div>
        <Avvvatars
          value={user?.name || 'Temporary User'}
          style='shape'
          size={isMobile ? 24 : 32}
        />
      </div>
    </div>
  )
}

export default UserPanel
