import { Modal, Row, Divider, Switch } from 'antd'
import { SoundOutlined, GithubOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { openVoiceAtom } from '~/state'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [openVoice, setOpenVoice] = useAtom(openVoiceAtom)
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} closable={false}>
      <Row align="middle" justify="space-between">
        <Row align="middle" className="gap-1">
          <SoundOutlined />
          <span>{t('use_voice_answer')}</span>
        </Row>
        <Switch checked={openVoice} onClick={() => setOpenVoice(!openVoice)} />
      </Row>
      <Divider />
      <Row align="middle" justify="space-between">
        <Row align="middle" className="gap-1">
          <GithubOutlined />
          <span>Github</span>
        </Row>
        <a
          href=" https://github.com/circle-hotaru/talk-boost-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/circle-hotaru/talk-boost-ai
        </a>
      </Row>
    </Modal>
  )
}

export default SettingsModal
