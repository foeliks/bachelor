import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Table,
    // Tag,
} from 'antd'


function Ranking(props) {
    const [ranking, setRanking] = useState([])

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
                        .then(json => setRanking(json))
                }
            })
            .catch(error => console.error(error))

    }, [props.functions])

    return (
        <div>
            <PageHeader title="Rangliste" />
            <Table dataSource={ranking}>
                <Table.Column title="Platzierung" dataIndex="place" key="place" />
                <Table.Column title="Benutzer" dataIndex="username" key="username" />
                <Table.Column title="Sterne" dataIndex="stars" key="stars" />
            </Table>
        </div>
    )
}

export default Ranking;