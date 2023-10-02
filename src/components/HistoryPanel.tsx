import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { setLocal, getLocal, removeLocal } from '~/utils'
import { isMobile } from 'react-device-detect'
import { useAtom } from 'jotai'
import { Drawer, Space } from 'antd'
import { recordNowHistory, recordNowHistoryName } from '~/state/settings'
import dayjs from 'dayjs'
import { DoubleRightOutlined, CloseOutlined } from '@ant-design/icons'
import { SYSTEM_MESSAGE } from '~/constants'

const HistoryPanel = ({ msgList }, ref) => {
  const { t, i18n } = useTranslation()
  const [historyList, setHistoryList] = useState([])
  const [currentChat, setCurrentChat] = useState(0)
  const [recordCount, setRecordCount] = useAtom(recordNowHistory)
  const [recordName, setRecordName] = useAtom(recordNowHistoryName)
  const [recordFlags, setRecordFlags] = useState(false)
  const [open, setOpen] = useState(false)

  const handleChangeLanguage = () => {
    const currentLanguage = i18n.language
    const newLanguage = currentLanguage === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  useImperativeHandle(ref, () => ({
    handleAdd: handleAddHistory,
  }))

  useEffect(() => {
    if (!getLocal('history')) {
      const initHistory = [
        {
          name: `${dayjs(new Date()).format('YYYY-MM-DD')}-${recordCount}`,
          id: 1,
          details: msgList,
        },
      ]
      setLocal('history', initHistory)
      setHistoryList(initHistory)
    } else {
      let history = getLocal('history')
      if (!recordName) {
        setRecordName(history[0].name)
      }
      setHistoryList(history)
      handleDataRecord(msgList)
      setRecordFlags(true)
    }
  }, [msgList])

  useEffect(() => {
    if (historyList.length > 0 && recordFlags) {
      setLocal('history', historyList)
      setRecordFlags(false)
    }
    if (historyList.length === 0) {
      removeLocal('history')
    }
  }, [historyList, recordFlags])

  useEffect(() => {
    setHistoryList((currentChat) => {
      currentChat.forEach((item) => {
        if (item.name === recordName) {
          item.details = []
        }
      })
      let newArr = currentChat.slice()
      return newArr
    })
  }, [recordName])

  const handleDataRecord = (list) => {
    if (list.length > 0) {
      setHistoryList((currentChat) => {
        currentChat.forEach((item) => {
          if (item.name === recordName) {
            item.details = list
          }
        })
        let newArr = currentChat.slice()
        return newArr
      })
    }
  }
  const handleItemClick = (item, index) => {
    setCurrentChat(index)
    setRecordName(() => item.name)
  }
  const handleAddHistory = () => {
    let date = dayjs(new Date()).format('YYYY-MM-DD')
    setHistoryList((pre) => {
      return [
        ...pre,
        {
          name: `${date}-${recordCount + 1}`,
          id: pre.length + 1,
          details: [
            {
              role: 'system',
              content: SYSTEM_MESSAGE,
            },
          ],
        },
      ]
    })
    setRecordCount(() => recordCount + 1)
    setRecordName(`${date}-${recordCount + 1}`)
    setCurrentChat(historyList.length)
    setRecordFlags(true)
  }
  const handleDeleteChat = (index) => {
    setRecordFlags(true)
    setHistoryList((value) => {
      const copy = [...value]
      copy.splice(index, 1)
      return copy
    })
    setCurrentChat(
      index + 1 >= historyList.length ? historyList.length - 2 : index + 1
    )
  }
  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <>
      {!isMobile ? (
        <div className='mr-2 flex h-full w-40 max-w-xs flex-col justify-between overflow-auto rounded-lg border-2 border-solid border-gray-line bg-primary'>
          <div className='flex-1 overflow-y-auto rounded-lg border-0 border-solid border-gray-line'>
            {historyList.map((item, index) => (
              <div
                className={`h-20  border-0 border-b-2 border-solid border-gray-line p-3 text-base font-bold ${
                  currentChat === index ? 'bg-[#B3B2AD]' : 'bg-primary'
                } text-gray-900 hover:bg-[#B3B2AD]`}
                key={item.id}
                onClick={() => handleItemClick(item, index)}
              >
                {item.name}
                <div className='mt-3 cursor-pointer text-end text-xs text-gray-400'>
                  <span onClick={() => handleDeleteChat(index)}>
                    {t('delete')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className='h-9 cursor-pointer border-0 border-t-2 border-solid border-gray-line bg-primary text-center font-bold leading-8 text-gray-900 hover:bg-[#B3B2AD]'
            onClick={handleAddHistory}
          >
            {`💬 ${t('new_chat')}`}
          </div>
          <div
            className='h-9 cursor-pointer border-0 border-t-2 border-solid border-gray-line bg-primary text-center font-bold leading-8 text-gray-900 hover:bg-[#B3B2AD]'
            onClick={handleChangeLanguage}
          >
            {`🌐 ${t('switch_language')}`}
          </div>
        </div>
      ) : (
        <div className=' flex items-center pr-3 text-gray-950'>
          <div onClick={showDrawer}>
            <DoubleRightOutlined />
          </div>
          <Drawer
            placement='left'
            title={t('history')}
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
            extra={
              <Space>
                <CloseOutlined onClick={onClose} className='text-gray-400' />
              </Space>
            }
          >
            <div>
              {historyList.map((item, index) => (
                <div
                  className={`h-20  border-b border-l-0 border-r-0 border-t-0 border-solid border-white p-3 text-base font-bold ${
                    currentChat === index
                      ? 'bg-gray-900 text-amber-50'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                  key={item.id}
                  onClick={() => handleItemClick(item, index)}
                >
                  {item.name}
                  <div className='mt-3 cursor-pointer text-end text-xs text-gray-400'>
                    <span onClick={() => handleDeleteChat(index)}>
                      {t('delete')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Drawer>
        </div>
      )}
    </>
  )
}
export default forwardRef(HistoryPanel)
