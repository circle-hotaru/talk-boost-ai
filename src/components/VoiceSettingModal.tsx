import { Modal, Avatar } from 'antd'
import { useAtom } from 'jotai'
import { voiceIdAtom, isShowVoiceSettingModal } from '~/state'

const voices = {
  Jenny: 'en-US-JennyNeural',
  Jason: 'en-US-JasonNeural',
  Emma: 'en-US-EmmaNeural',
  Eric: 'en-US-EricNeural',
}

const VoiceSettingModal: React.FC = () => {
  const [open, setOpen] = useAtom(isShowVoiceSettingModal)
  const [voiceId, setVoiceId] = useAtom(voiceIdAtom)

  return (
    <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
      <div className='w-full'>
        <h1 className='text-center text-2xl font-bold'>Voice Setting</h1>
        <div className='flex flex-row flex-wrap items-center justify-center gap-4'>
          {Object.entries(voices).map(([name, voice]) => (
            <div
              key={voice}
              className={`flex w-2/5 cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border-2 border-solid ${
                voiceId === voice ? 'border-blue-400' : 'border-gray-line'
              } bg-primary transition-transform hover:scale-105`}
              onClick={() => setVoiceId(voice)}
            >
              <Avatar
                src={<img src={`/images/${name}.png`} />}
                className='h-24 w-24 rounded-full'
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default VoiceSettingModal
