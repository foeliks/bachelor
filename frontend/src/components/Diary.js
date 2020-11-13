import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Collapse,
    Card
} from 'antd'


function Diary(props) {

    const [diary, setDiary] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8000/robob/diary/`, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                if (res.status !== 200) {
                    setDiary([]);
                    props.functions.logOut();
                }
                else {
                    res.json()
                        .then(json => setDiary(json))
                }
            })
            .catch(error => console.error(error))
    }, [props.functions])

    return (
        <div>
            <PageHeader title="Tagebuch" />
            <Collapse>
                {diary.map(category => (
                    <Collapse.Panel header={category.title} key={category.id}>
                        {category.knowledge.map(knowledge => (
                            <Card>
                                <div key={knowledge.id} dangerouslySetInnerHTML={{ __html: knowledge.description }} />
                            </Card>
                        ))}
                    </Collapse.Panel>
                ))}
            </Collapse>

        </div>
    )
}

export default Diary;