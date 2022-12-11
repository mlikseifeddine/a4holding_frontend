import { Layout, Breadcrumb, Empty, Divider, Row, Col, message, Form, Input, Modal, Table, Button, Radio, Select, Popover, Alert } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useLocation } from "react-router-dom";
import { itemRender } from "../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import CustomSider from "../components/CustomSider"
import { useState, useEffect } from 'react';
import moment from "moment";
import CustomHeader from '../components/CustomHeader';

const { Content, Footer} = Layout;
const { Option } = Select;

const Users = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const [ newUserForm ] = Form.useForm();
    const [ editUserForm ] = Form.useForm();

    const routes = [
        {
        path: location.pathname,
        breadcrumbName: t("users"),
        },
    ];

    // Handles fetched society
    const [ users, setUsers ] = useState(null)

    // Handles selected society
    const [ society, setSociety ] = useState(null)
    const [ editUser, setEditUser ] = useState(null)
    
    const [ showUserModal, setShowUserModal] = useState(false); // Handles newuser modal state
    const [ showEdituserModal, setShowEditUserModal] = useState(false); // Handles edituser modal state

    // Load userlist at first render.
    useEffect(() => {
    (async () => {
        const result = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/users",
        {
            method: "GET",
            mode: "cors",
            credentials: "include",
        }
        );

        const soclist = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/societies",
            {
                method: "GET",
                mode: "cors",
                credentials: "include",
            }
            );

        if (result.status === 200 && soclist.status === 200) {
        setUsers(await result.json())
        setSociety(await soclist.json())
        };
    })();
    }, []);

    const columns = [
    {
        title: t("name"),
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: t("username"),
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: t("auth"),
        dataIndex: 'auth',
        key: 'auth',
        render: auth => ( auth === 0 ? <span>{t("compliancemanager")}</span> : <span>{t("domainmanager")}</span>)
    },
    {
        title: t("societies"),
        dataIndex: 'societies',
        key: 'societies',
        render: societies => (
            <Popover trigger="hover" content={
            <div>{
                societies.map((soc)=>(
                    <p>{soc.name}</p>
                ))
            }
            </div>
            } title={t("societies")}>
            <Button type="link" >{t("view")+" "+t("societies").toLowerCase()}</Button>
          </Popover>
        )
    },
    {
        title: t("updatedat"),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: updatedAt => ( moment(updatedAt).format("DD/MM/YYYY"))
    },
    ];

    /* Opens and displays new Model for user creation. */ 
    const NewUserModal = (props) => {
        const { t } = useTranslation();
        const form = props.form;

        return (
        <Modal
            centered
            title={t("newuser")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => form.submit()}
            {...props}
        >
            <Form
            name="complex-form-add"
            form={form}
            layout="vertical"
            onFinish={props.onFinish}
            >
            <Form.Item label={t("name")} name="name" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("username")} name="username" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("password")} name="password" rules={[{required: true, message: t("emptyField")}]}>
                <Input.Password />
            </Form.Item>
            <Form.Item label={t("auth")} name="auth" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group>
                    <Radio value={0}>{t("compliancemanager")}</Radio>
                    <Radio value={1}>{t("domainmanager")}</Radio>
                </Radio.Group>
            </Form.Item>
                <Form.Item label={t("societies")} name="societies" rules={[{required: true, message: t("emptyField")}]}>
                    <Select mode="multiple" placeholder={t("selectSociety")} style={{ width: "100%" }} allowClear>
                        {society &&                                     
                            society.map((soc) => ( <Option key={soc.id}>{soc.name}</Option>  
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
        );
    };

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onNewUserFinish(values) {

        const data = {
            user: 
                {
                name: values.name,
                username: values.username,
                password: values.password,
                },
            auth: values.auth,
            societies: values.societies
        }
        
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/users/new",
            {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
            );

        if (result.status === 201) {
            message.success(t("newusersuccess"));
            const updateusers = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/users",
                {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
                );
        
            if (updateusers.status === 200) {
                setUsers(await updateusers.json())
            };
            newUserForm.resetFields()
            setShowUserModal(false);
        } else {
            message.error(t("newusererror"));
            newUserForm.resetFields()
            setShowUserModal(false);
        }
    }

    /* Opens and displays new Model for user creation. */ 
    const EditUserModal = (props) => {
        const { t } = useTranslation();
        const form = props.form;

        const soclist = []
        if (editUser){
            for (const s of editUser.societies){
                soclist.push(s.id)
            }
        }

        form.setFieldsValue({
            name: editUser && editUser.name,
            username: editUser && editUser.username,
            auth: editUser && editUser.auth,
            societies: soclist,
        })
        
        return (
        <Modal
            centered
            title={t("edituser")}
            okText={t("send")}
            cancelText={t("back")}
            onOk={() => form.submit()}
            {...props}
        >
            <Form
            name="complex-form-add"
            form={form}
            layout="vertical"
            onFinish={props.onFinish}
            >
            <Form.Item label={t("name")} name="name" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("username")} name="username" rules={[{required: true, message: t("emptyField")}]}>
                <Input />
            </Form.Item>
            <Form.Item label={t("auth")} name="auth" rules={[{required: true, message: t("emptyField")}]}>
                <Radio.Group>
                    <Radio value={0}>{t("compliancemanager")}</Radio>
                    <Radio value={1}>{t("domainmanager")}</Radio>
                </Radio.Group>
            </Form.Item>
                <Form.Item label={t("societies")} name="societies" rules={[{required: true, message: t("emptyField")}]}>
                    <Select mode="multiple" placeholder={t("selectSociety")} style={{ width: "100%" }} allowClear>
                        {society &&                                     
                            society.map((soc) => ( <Option key={soc.id}>{soc.name}</Option>  
                        ))}
                    </Select>
                </Form.Item>
            </Form>
            <Divider/>
            <div className="inner-container">
              <Button icon={<DeleteOutlined/>} style={{width: "100%"}} type="danger" onClick={() => {
                setShowEditUserModal(false)
                confirmDelete(editUser.id)
              }}>{t("deleteuser")}</Button>
            </div>
        </Modal>
        );
    };

    /* Handles creation of new users: called on new user Modal confirmation. */ 
    async function onEditUserFinish(values) {

        const data = {
            user: 
                {
                name: values.name,
                username: values.username,
                },
            auth: values.auth,
            societies: values.societies
        }
        
        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/users/edit/"+editUser.id,
            {
                method: "PUT",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
            );

        if (result.status === 200) {
            message.success(t("editusersuccess"));
            const updateusers = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/users",
                {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
                );
        
            if (updateusers.status === 200) {
                setUsers(await updateusers.json())
            };
            editUserForm.resetFields()
            setShowEditUserModal(false);
        } else {
            message.error(t("editusererror"));
            editUserForm.resetFields()
            setShowEditUserModal(false);
        }
    }

    async function deleteUser(id){

        const result = await fetch(
            process.env.REACT_APP_API_ENDPOINT + "/users/delete/"+id,
            {
                method: "DELETE",
                mode: "cors",
                credentials: "include",
            }
            );

        if (result.status === 200) {
            message.success(t("deleteusersuccess"));
            const updateusers = await fetch(
                process.env.REACT_APP_API_ENDPOINT + "/users",
                {
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                }
                );
        
            if (updateusers.status === 200) {
                setUsers(await updateusers.json())
            };
            editUserForm.resetFields()
        } else {
            message.error(t("deleteusererror"));
            editUserForm.resetFields()
        }
    }

    function confirmDelete(id){
        Modal.confirm({
          title: t("confirmdelete"),
          icon: <ExclamationCircleOutlined style={{color: "#f5222d"}}/>,
          width:"40%",
          content: (
            <div style={{paddingTop: "24px"}}>
            <Form name="delete-form">
                <Alert style={{marginBottom:"1.5rem"}} icon={<ExclamationCircleOutlined/>} message={t("editprocesswarning")} description={t("deleteuserwarning")} type="error" showIcon/>
                <div style={{marginBottom:"1rem", fontSize: "18px"}}>{t("deletecheck")}</div>
                <Form.Item name="fieldvalue">
                    <Input.Password className="deleteinput" />
                </Form.Item>         
            </Form>
            </div>
          ),
          okText: t("confirm"),
          okType: 'danger',
          cancelText: t("back"),
          onOk() {
            deleteUser(id)
          },
        });
      }

  return (
    <Layout style={{minHeight: "100vh"}}>
      <CustomSider selectedMenu="users" isOpen={true}/>
        <Layout className="site-layout">
          <CustomHeader title={t("appTitle")} breadcrumb={ <Breadcrumb className="flex-center-row" itemRender={itemRender} routes={routes}/>} ></CustomHeader>
          <Content className="content">
            <Divider className="contenttitle" orientation="left">{t("users")}</Divider>
          {users ? 
          <div className="data-container" style={{height: "100%"}}>
            <Row className="flex-center-row" gutter={16} style={{margin: "0rem 0rem 1.5rem 0rem"}}>
                    <Col span={21}>
                        <Divider className="contenttitle" orientation="left">{t("userlist")}</Divider>
                    </Col>
                    <Col span={3}>
                        <Button icon={<PlusOutlined />} style={{width:"100%"}} type="primary" onClick={() => setShowUserModal(true)} >{t("newuser")}</Button>
                    </Col>
                </Row>
            <Table dataSource={users} columns={columns} rowKey="id" rowClassName={() => 'clickable-pointer'}
            onRow={(record) => {
              return {
                onClick: () => {
                    setEditUser(record)
                    setShowEditUserModal(true)
                },
              };
            }}/>
            </div>
            :
            <Empty className="emptycontainer" description={t("emptyrisk")}></Empty>
            }
          </Content>
          <NewUserModal visible={showUserModal} form={newUserForm} onFinish={onNewUserFinish}
                onCancel={() => {
                newUserForm.resetFields()
                setShowUserModal(false)}}
            />
            <EditUserModal visible={showEdituserModal} form={editUserForm} onFinish={onEditUserFinish}
                onCancel={() => {
                editUserForm.resetFields()
                setShowEditUserModal(false)}}
            />
          <Footer style={{ textAlign: 'center' }}>Deloitte Risk Advisory ©2021</Footer>
        </Layout>
      </Layout>
    );
};

export default Users;