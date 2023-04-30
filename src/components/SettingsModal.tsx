import { Modal, Row, Divider, Switch } from 'antd'
import { SoundOutlined, GithubOutlined } from '@ant-design/icons'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} closable={false}>
      <Row align="middle" justify="space-between">
        <Row align="middle" className="gap-1">
          <SoundOutlined />
          <span>Turn on voice answer</span>
        </Row>
        <Switch />
      </Row>
      <Divider />
      <Row align="middle" justify="space-between">
        <Row align="middle" className="gap-1">
          <GithubOutlined />
          <span>Link</span>
        </Row>
        <a
          href=" https://github.com/circle-hotaru/talk-boost"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/circle-hotaru/talk-boost
        </a>
      </Row>
    </Modal>
  )
}

export default SettingsModal
