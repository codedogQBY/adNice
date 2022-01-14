import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, message } from 'antd';
import React, { useState } from 'react';
import Excel from './Excle';
import exportExcel from './exportExcel';
import './index.less';
import { dp } from './main';
import ShowTable from './ShowTable';

export default function IndexPage() {
  const [data, setData] = useState([])
  const [isOut, setIsOut] = useState(false) // 是否可以导出
  const [isUp, setIsUp] = useState(false) // 是否可以计算
  const [minP1, setMinP1] = useState(2000) // 2000下限
  const [maxP1, setMaxP1] = useState(2100) // 2000上限
  const [minP2, setMinP2] = useState(1000)
  const [maxP2, setMaxP2] = useState(1050)
  const [dataSource, setDataSource] = useState([]) // 数据源
  const [columns, setColumns] = useState([])
  const [noLogin, setLogin] = useState(true) // 是否登录

  const getData = data => {
    let res = JSON.parse(JSON.stringify(data))
    res = res.map(item=>{
      item['原价'] = item['原价'] + ''
      return item
    })
    setIsUp(true)
    setData(res)
  }

  const getUseArr = (obj) => {
    let useArr = obj["组合"]
    useArr = useArr.map((item, index) => {
      let temp = {}
      temp["groupNum"] = index + 1
      item.forEach((item, index) => {
        temp["price" + (index + 1)] = item
      })
      temp["sum"] = item.reduce((pre, cur) => {
        return pre + cur
      }, 0)
      return temp
    })
    return useArr
  }

  const getUnUseArr = (obj) => {
    let UnUseArr = obj["剩余组"]
    UnUseArr = UnUseArr.reduce((pre, cur) => {
      let newArr = JSON.parse(JSON.stringify(pre))
      let temp = {}
      temp["price"] = cur
      temp["nums"] = 1
      newArr.push(temp)
      return newArr
    }, [])
    return UnUseArr
  }

  const handleClick = () => {
    let result = data.map(item => {
      let temp = {}
      temp.nums = item["数量"]
      temp.price = item["原价"]
      temp.price = typeof temp.price === "string" ? temp.price.replace(",", "") : temp.price
      temp.price = Number.parseInt(temp.price)
      return temp
    })
    // 第一轮运算
    let obj1 = dp(result, minP1, maxP1)
    // 第二轮运算
    let obj2 = dp(getUnUseArr(obj1), minP2, maxP2)
    const unUse = getUnUseArr(obj2).reduce((pre, cur, index) => {
      let temp = JSON.parse(JSON.stringify(pre))
      for (let i = 0; i < cur.nums; i++) {
        temp["price" + (index + i + 1)] = cur.price
      }
      return temp
    }, {})
    unUse.groupNum = '剩余'

    // 展开所有数组
    const res = [...getUseArr(obj1), ...getUseArr(obj2), ...[unUse]]
    // 计算剩余
    let test = Object.values(unUse).reduce((pre, cur) => {
      if (pre.hasOwnProperty(cur)) {
        pre[cur]++
      } else {
        pre[cur] = 1
      }
      return pre
    }, {})
    delete test['剩余']

    // 保存成表格能识别的格式
    let outprice = Object.keys(test).reduce((pre, cur, index) => {
      pre[`price${index + 1}`] = `${cur} ${test[cur]}个`
      return pre
    }, {})

    outprice['groupNum'] = '剩余'
    // 重新更改res的组数
    for (let i = 0; i < res.length; i++) {
      if (res[i].groupNum !== '剩余') {
        res[i].groupNum = i + 1
      }
    }
    // 更新剩余组
    res[res.length - 1] = outprice
    // 获取有几个元素
    const len = res.map(item => {
      return item
    }).reduce((pre, cur) => {
      let l = Object.keys(cur).length
      return l > pre ? l : pre
    }, 0)
    const columns = []

    for (let i = 0; i < len; i++) {
      if (i === 0) {
        columns.push({ title: "组数", dataIndex: "groupNum", key: "groupNum" })
      } else if (i === len - 1) {
        columns.push({ title: "总价", dataIndex: "sum", key: "sum" })
      } else {
        columns.push({ title: "单价" + i, dataIndex: "price" + i, key: "price" + i })
      }
    }

    setColumns(columns)
    setDataSource(res)
    setIsOut(true)
  }

  function onChange1(value) {
    setMinP1(value)
  }

  function onChange2(value) {
    setMaxP1(value)
  }

  function onChange3(value) {
    setMinP2(value)
  }

  function onChange4(value) {
    setMaxP2(value)
  }

  const onFinish = ({ password }) => {
    if (password === "qwe123456") {
      setLogin(false)
      message.success("密码正确")
    } else {
      message.error("密码错误")
    }
  }
  return (
    <>
      {
        false ?
          <div className="login">
            <Form
              name="normal_login"
              onFinish={onFinish}
            >
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: '请输入密码!',
                  },
                ]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="密码"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  确定
                </Button>
              </Form.Item>
            </Form>
          </div>
          :
          <div className="main">
            <div className="tip">
              <Card style={{ width: 250, background: "rgba(255,255,255,0.5)" }}>
                <p>
                  请注意导入的文件必须为excle表格，且表格中必须包含数量与原价两列，如上传失败，请检查是否为excle文件；如计算失败，请检查导入文件是否包含数量与原价两列。
                </p>
              </Card>
            </div>
            <Excel getData={getData}>
              <div style={{ marginLeft: "30px" }}>{(isUp ? "已上传" : "未上传") + "文件"}</div>
            </Excel>
            <Button onClick={handleClick} disabled={!isUp} className="calculate">计算</Button>
            <Button
              type="primary"
              onClick={() => exportExcel(columns, dataSource)}
              className="output"
              disabled={!isOut}
            >
              导出文件
            </Button>
            <div style={{ width: "100%" }} className="numInput">
              <span className="lable">第一个范围：</span>
              <InputNumber
                defaultValue={minP1}
                onChange={onChange1}
              />
              <InputNumber
                defaultValue={maxP1}
                onChange={onChange2}
              />
            </div>
            <div style={{ width: "100%" }} className="numInput">
              <span className="lable">第二个范围：</span>
              <InputNumber
                defaultValue={minP2}
                onChange={onChange3}
              />
              <InputNumber
                defaultValue={maxP2}
                onChange={onChange4}
              />
            </div>
            <div className="table">
              <ShowTable columns={columns} dataSource={dataSource}></ShowTable>
            </div>
          </div>}
    </>
  );
}
