import { useState, useEffect, useRef } from 'react'
import { isIOS, setLocal, getLocal } from '~/utils'
import { useAtom } from 'jotai'
import { Drawer } from 'antd'
import { recordNowHistory, recordNowHistoryName } from '~/state/settings'
import dayjs from 'dayjs'
import { DoubleRightOutlined } from '@ant-design/icons'
const HistoryPanel: React.FC<{
  msgList: any[]
}> = ({ msgList }) => {
  const [historyList, setHistoryList] = useState([])
  const [current, setCurrent] = useState(0)
  const [recordCount, setRecordCount] = useAtom(recordNowHistory)
  const [recordName, setRecordName] = useAtom(recordNowHistoryName)
  const [recordFlags, setRecordFlags] = useState(false)
  const [open, setOpen] = useState(false)
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
          details: [],
        },
      ]
    })
    setRecordCount(() => recordCount + 1)
    setRecordName(`${date}-${recordCount + 1}`)
    setCurrent(historyList.length)
    setRecordFlags(true)
  }
  const handleRemove = (index, id) => {
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
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    padding: 48,
    overflow: 'hidden',
    textAlign: 'center',
  }
  return (
    <>
      {isIOS ? (
        <div className="max-w-xs w-40 bg-gray-700 mt-4 mr-2 flex flex-col justify-between">
          <div className="flex-1">
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
                  <span onClick={() => handleRemove(index, item.id)}>删除</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="text-center font-bold bg-gray-900 h-9 leading-8 cursor-pointer"
            onClick={handleAddHistory}
          >
            +
          </div>
        </div>
      ) : (
        <div>
          <div
            className=" text-gray-950 flex items-center"
            onClick={showDrawer}
          >
            <DoubleRightOutlined />
          </div>
          <Drawer
            placement="left"
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
          ></Drawer>
        </div>
      )}
    </>
  )
}
export default HistoryPanel
