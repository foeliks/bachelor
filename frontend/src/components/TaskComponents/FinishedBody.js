import React from 'react';
import { useHistory } from 'react-router-dom';
import { PageHeader, Card } from 'antd';
import Unity from "react-unity-webgl";

function FinishedBody(props) {
    const history = useHistory();
    return (
        <div>
            <PageHeader title="Du bist Klasse" onBack={() => history.push('/overview')} />
            <Card style={{ border: '2px solid', borderColor: props.values.robobGreen, marginBottom: "10px" }}>
                <p>Du hast den höchsten Rang erreicht und damit Robob durchgespielt!<br />Du kannst stolz auf dich sein!</p>
            </Card>
        </div>
    )
}



export default FinishedBody;
