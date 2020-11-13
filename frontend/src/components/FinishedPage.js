import React from 'react';
import { useHistory } from 'react-router-dom';
import { PageHeader, Card } from 'antd';

function FinishedPage() {
    const history = useHistory();
    return (<div>
        <PageHeader title="Hier gibt es keine Aufgabe" onBack={() => history.goBack()} />
        <Card>
            <p>Es gibt zwei Möglichkeiten, warum Du auf dieser Seite gelandet bist</p>
            <ol>
                <li>Du hast bereits alle Aufgaben geschafft, dann darfst du stolz auf dich sein!</li>
                <li>Du hast in der URL einfach mal ausprobiert was rauskommt, dann gilt für dich:<br />ZURÜCK AN DIE ARBEIT!</li>
            </ol>
        </Card>
    </div>)
}



export default FinishedPage;
