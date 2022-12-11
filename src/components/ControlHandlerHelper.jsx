import { Row, Col, Select, Table, Button, Alert } from 'antd';

import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';s
import moment from "moment";

const { Option } = Select;

const ControlHandlerHelper = (props) => {
    const { t } = useTranslation();
    const { society, processid, statelifter } = {...props}

    const [ controls, setControls ] = useState(null) // Handles controls currently selected (shown in table)
    const [ newcontrol, setNewcontrol ] = useState(null) // Handles contros that gets added 
    const [ controlslist, setControlslist ] = useState(null) // Handles list of global controls for society

    useEffect(() => {
        if (controls) statelifter(controls);
        // eslint-disable-next-line
      }, [controls]);

    // Load controls list at first render.
    useEffect(() => {
    (async () => {
    
        const controlsresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/controls/byprocess/"+processid,
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
        );

        const controlslistresult = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/controls/bysociety/"+society,
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
        );
        
        if (controlsresult.status === 200 && controlslistresult.status === 200) {
            const fetchedcontrols = await controlsresult.json();
            const fetchedcontrolslist = await controlslistresult.json();
            setControls(fetchedcontrols)
            setControlslist(fetchedcontrolslist)


        }
    }
    )();
    }, [processid, society]);

        const columns = [
            {
                title: t("controlname"),
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => { return a.name.localeCompare(b.name)},
            },
            {
                title: t("controldescription"),
                dataIndex: 'description',
                key: 'description',
                sorter: (a, b) => { return a.description.localeCompare(b.description)},
            },
            {
                title: t("updatedat"),
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
            },
            {
                title: t("remove"),
                dataIndex: 'id',
                key: 'id',
                render: id => (<span className="remove" onClick={() => {
                    const newcont = [...controls]
                    for (const cont of newcont){
                        if (cont.id === id){
                            //index = newcont.indexOf(cont)
                            newcont.splice(newcont.indexOf(cont), 1)
                        }
                    }
                    setControls(newcont)
                }}>{t("remove")}</span>)
            },
        ]; 

    return (
        <div>
            <div style={{marginBottom:"1.5rem"}} >
            <Alert style={{marginBottom:"1.5rem"}}message={t("editprocesswarning")} description={t("editprocesscontrolswarningtext")} type="warning" showIcon/>
                <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("add")}</h3>
                <Row gutter={16}>
                    <Col span={20} style={{marginBottom: "1.5rem"}}>
                        <Select placeholder={t("selectcontrol")} value={newcontrol} style={{ width: "100%" }} onChange={(e) => setNewcontrol(e)} allowClear>
                            {controlslist &&
                                controls &&
                                controlslist
                                    .filter((cont) => !controls.some((cont2) => cont.id === cont2.id))
                                    .map((cont) => ( <Option key={cont.id} >{cont.name} - {cont.description}</Option> ))
                            }
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button style={{width: "100%"}} type="primary" onClick={() => {
                            const newvalue = [...controls]
                            for (const cont of controlslist){
                                if (cont.id === newcontrol){
                                    //index = newcont.indexOf(cont)
                                    newvalue.push(cont)
                                }
                            }
                            setControls(newvalue)
                            setNewcontrol()
                        }} >{t("add")}</Button>
                    </Col>
                </Row>
            </div>
            <h3 style={{marginBottom:"0.5rem"}} strong="false">{t("seletedcontrols")}</h3>
            <Table dataSource={controls} columns={columns} rowKey="id"/>
        </div>
    );
};

export default ControlHandlerHelper;