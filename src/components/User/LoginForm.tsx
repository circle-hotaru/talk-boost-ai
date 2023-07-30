import { Form, Input, Button } from 'antd'
import { useAtom } from 'jotai'
import { authModalOpenAtom } from '~/state'

interface LoginFormProps {
  toRegister: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ toRegister }) => {
  const [open, setOpen] = useAtom(authModalOpenAtom)

  const login = async (values: any) => {
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (res.status === 200) {
        const { user } = await res.json()
        window.localStorage.setItem('user', JSON.stringify(user))
        setOpen(false)
      } else {
        console.log(res.statusText)
      }
    } catch (error) {
      console.error('failed to login', error)
    }
  }

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      onFinish={login}
    >
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
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
          登录
        </Button>
        <Button onClick={toRegister} className="ml-8">
          {'去注册'}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default LoginForm
