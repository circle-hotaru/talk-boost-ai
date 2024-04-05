import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { voiceIdAtom } from '~/state'
import { voices } from '~/constants'

const VoiceSettingModal: React.FC = () => {
  const { t } = useTranslation()
  const [voiceId, setVoiceId] = useAtom(voiceIdAtom)

  const handleOptionChange = (event) => {
    setVoiceId(event.target.value)
  }

  return (
    <div className='flex items-center gap-2'>
      <label htmlFor='voice' className='text-sm font-medium text-gray-900'>
        {t('voice_model')}
      </label>

      <select
        name='voice'
        id='voice'
        value={voiceId}
        onChange={handleOptionChange}
        className='w-28 rounded-lg border-gray-300 bg-transparent px-2 py-1 text-right text-gray-700'
      >
        {voices.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default VoiceSettingModal
