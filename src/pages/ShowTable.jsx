import { Table } from 'antd';
import React from 'react';
import './index.less';

const ShowTable = ({dataSource,columns,loading})=>{
    return (<><Table  dataSource={dataSource} columns={columns} rowKey={dataSource.grounpNum}/></>)
}

export default ShowTable
