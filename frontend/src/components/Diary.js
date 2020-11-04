import React, { useState, useEffect } from 'react';
import {
    PageHeader
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
                    //props.functions.logOut();
                }
                else {
                    res.json()
                        .then(json => setDiary(json))
                }
            })
            .catch(error => console.log(error))
    }, [])

    console.log(diary)

    return (
        <div>
            <PageHeader title="Tagebuch" />
            {/* <ul>
                {diary.map(entry => <li></li>)}
            </ul> */}
            
        </div>
    )
}

export default Diary;