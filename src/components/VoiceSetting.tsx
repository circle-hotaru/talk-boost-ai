import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { voiceIdAtom } from '~/state'
import { voices } from '~/constants'
import { Select } from 'antd'

const VoiceSettingModal: React.FC = () => {
  const { t } = useTranslation()
  const [voiceId, setVoiceId] = useAtom(voiceIdAtom)

  const handleOptionChange = (value: string) => {
    setVoiceId(value)
  }

  return (
    <div className='flex items-center gap-2'>
      <label htmlFor='voice' className='text-sm font-medium text-gray-900'>
        {t('voice_model')}
      </label>
      <Select onChange={handleOptionChange} value={voiceId} className='w-28'>
        {voices.map(({ id, name }) => (
          <Select.Option key={id} value={id}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default VoiceSettingModal
