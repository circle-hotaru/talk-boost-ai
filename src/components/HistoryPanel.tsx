import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { isMobile, setLocal, getLocal, removeLocal } from '~/utils'
import { useAtom } from 'jotai'
import { Drawer, Space } from 'antd'
import { recordNowHistory, recordNowHistoryName } from '~/state/settings'
import dayjs from 'dayjs'
import { DoubleRightOutlined, CloseOutlined } from '@ant-design/icons'
import { SYSTEM_MESSAGE } from '~/constants'

const HistoryPanel = ({ msgList }, ref) => {
  const [historyList, setHistoryList] = useState([])
  const [current, setCurrent] = useState(0)
  const [recordCount, setRecordCount] = useAtom(recordNowHistory)
  const [recordName, setRecordName] = useAtom(recordNowHistoryName)
  const [recordFlags, setRecordFlags] = useState(false)
  const [open, setOpen] = useState(false)
  useImperativeHandle(ref, () => ({
    handleAdd: handleAddHistory,
  }))
  useEffect(() => {
    if (!getLocal('history')) {
      setLocal('history', [
        {
          name: `${dayjs(new Date()).format('YYYY-MM-DD')}-${recordCount}`,
          id: 1,
          details: msgList,
        },
      ])
      setHistoryList([
        {
          name: `${dayjs(new Date()).format('YYYY-MM-DD')}-${recordCount}`,
          id: 1,
          details: msgList,
        },
      ])
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
    setHistoryList((current) => {
      current.forEach((item) => {
        if (item.name === recordName) {
          item.details = []
        }
      })
      let newArr = current.slice()
      return newArr
    })
  }, [recordName])

  const handleDataRecord = (list) => {
    if (list.length > 0) {
      setHistoryList((current) => {
        current.forEach((item) => {
          if (item.name === recordName) {
            item.details = list
          }
        })
        let newArr = current.slice()
        return newArr
      })
    }
  }
  const handleItemClick = (item, index) => {
    setCurrent(index)
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
    setCurrent(historyList.length)
    setRecordFlags(true)
  }
  const handleRemove = (index) => {
    setRecordFlags(true)
    setHistoryList((value) => {
      const copy = [...value]
      copy.splice(index, 1)
      return copy
    })
    setCurrent(
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
      {!isMobile() ? (
        <div className="h-full max-w-xs w-40 bg-primary flex flex-col justify-between rounded-lg overflow-auto border-solid border-2 border-gray-line mr-2">
          <div className="flex-1 overflow-y-auto rounded-lg border-solid border-0 border-gray-line">
            {historyList.map((item, index) => (
              <div
                className={`font-bold  h-20 p-3 border-solid border-0 border-b-2 border-gray-line text-base bg-primary text-gray-900 hover:bg-[#B3B2AD]`}
                key={item.id}
                onClick={() => handleItemClick(item, index)}
              >
                {item.name}
                <div className="text-gray-400 text-xs text-end mt-3 cursor-pointer">
                  <span onClick={() => handleRemove(index)}>Delete</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="text-center font-bold text-gray-900 bg-primary h-9 leading-8 border-solid border-0 border-t-2 border-gray-line cursor-pointer hover:bg-[#B3B2AD]"
            onClick={handleAddHistory}
          >
            Start a new chat
          </div>
        </div>
      ) : (
        <div className=" text-gray-950 flex items-center pr-3">
          <div onClick={showDrawer}>
            <DoubleRightOutlined />
          </div>
          <Drawer
            placement="left"
            title="历史记录"
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
            extra={
              <Space>
                <CloseOutlined onClick={onClose} className="text-gray-400" />
              </Space>
            }
          >
            <div>
              {historyList.map((item, index) => (
                <div
                  className={`font-bold  h-20 p-3 border-solid border-b border-t-0 border-r-0 border-l-0 border-white text-base ${
                    current === index
                      ? 'bg-gray-900 text-amber-50'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                  key={item.id}
                  onClick={() => handleItemClick(item, index)}
                >
                  {item.name}
                  <div className="text-gray-400 text-xs text-end mt-3 cursor-pointer">
                    <span onClick={() => handleRemove(index)}>Delete</span>
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
