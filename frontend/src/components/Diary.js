import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Collapse,
    Card
} from 'antd'


function Diary(props) {

    return (
        <div>
            <PageHeader title="Tagebuch" />
            <Collapse>
                {props.values.diary.map(category => (
                    <Collapse.Panel header={category.title} key={category.id}>
                        {category.knowledge.map(knowledge => (
                            <Card style={{ marginTop: "5px", border: '2px solid', borderColor: '#7CB6FF' }}>
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