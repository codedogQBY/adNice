import React,{useState}from 'react'
import  './index.less';
import {Table} from 'antd';

const ShowTable = ({dataSource,columns})=>{
    return (<><Table dataSource={dataSource} columns={columns} rowKey={dataSource.grounpNum}/></>)
}

export default ShowTable