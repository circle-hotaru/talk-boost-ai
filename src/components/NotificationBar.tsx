import { Alert } from 'antd'
import { useTranslation } from 'react-i18next'

const NotificationBar = () => {
  const { t } = useTranslation()
  return (
    <div className='mt-2 px-2 md:px-8'>
      <Alert message={t('notification')} type='warning' />
    </div>
  )
}

export default NotificationBar
