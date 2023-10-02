import { useTranslation } from 'react-i18next'
import { Form, Input, Button, message } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom } from '~/state'

interface RegisterFormProps {
  toLogin: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ toLogin }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useAtom(authModalOpenAtom)
  const [messageApi, contextHolder] = message.useMessage()

  const register = async (values: any) => {
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      if (res.status === 409) {
        messageApi.error(t('user_exists'))
        return
      }
      if (res.status === 201) {
        const { user } = await res.json()
        window.localStorage.setItem('user', JSON.stringify(user))
        setOpen(false)
      } else {
        console.log(res.statusText)
      }
    } catch (error) {
      console.error('failed to register', error)
    }
  }

  return (
    <>
      {contextHolder}
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={register}
      >
        <Form.Item
          label={t('username')}
          name='username'
          rules={[{ required: true, message: t('error.input_username') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('email')}
          name='email'
          rules={[{ required: true, message: t('error.input_email') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('password')}
          name='password'
          rules={[{ required: true, message: t('error.input_password') }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type='primary' htmlType='submit'>
            {t('register')}
          </Button>
          <Button htmlType='button' onClick={toLogin} className='ml-8'>
            {t('go_to_login')}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default RegisterForm
