import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Table,
    Spin
} from 'antd'
import {
    LoadingOutlined
} from '@ant-design/icons';


function Ranking(props) {
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState([]);
    const [userIndex, setUserIndex] = useState(-1);

    useEffect(() => {

        fetch(`http://localhost:8000/robob/ranking`, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    setRanking([]);
                    props.functions.logOut();
                }
                else {
                    res.json()
                        .then(json => {
                            setRanking(json);
                            setLoading(false);
                        })
                }
            })
            .catch(error => console.error(error))

    }, [props.functions])

    
    return (
        <div>
            <PageHeader title="Rangliste" />
            {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ display: 'flex', justifyContent: 'center' }} /> :
                <Table
                    onRow={(record, rowIndex) => record.username === props.values.username && setUserIndex(rowIndex)}
                    rowClassName={(record, index) => index === userIndex && 'highlight-row'}
                    dataSource={ranking}
                    pagination={false}>
                    <Table.Column title="Platzierung" dataIndex="place" key="place" />
                    <Table.Column title="Benutzer" dataIndex="username" key="username" />
                    <Table.Column title="Sterne" dataIndex="stars" key="stars" />
                    <Table.Column title="Mitarbeiter Rang" dataIndex="employee_rank" key="employee_rank" />
                </Table>
            }
        </div>
    )
}

export default Ranking;