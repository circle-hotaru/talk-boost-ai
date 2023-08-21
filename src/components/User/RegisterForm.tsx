import { Form, Input, Button, message } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom } from '~/state'

interface RegisterFormProps {
  toLogin: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ toLogin }) => {
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
        messageApi.error('用户已存在')
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
      {' '}
      {contextHolder}
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={register}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            注册
          </Button>
          <Button htmlType="button" onClick={toLogin} className="ml-8">
            {'去登录'}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default RegisterForm
