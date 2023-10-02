import ReactMarkdown from 'react-markdown'

const UserPanel: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      className={
        'self-end rounded-lg bg-blue-400 px-3 py-2 text-right font-normal text-slate-50'
      }
    >
      {content}
    </ReactMarkdown>
  )
}

export default UserPanel
