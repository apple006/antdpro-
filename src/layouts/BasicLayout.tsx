/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  DefaultFooter,
  SettingDrawer,
} from '@ant-design/pro-layout';
import React, {useEffect, useState} from 'react';
import { Link, useIntl, connect, Dispatch, history } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import {Result, Button, Tabs, message,Dropdown,Menu} from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import styles from './BasicLayout.less';

let menus:MenuDataItem[] = [];
let tabMenus:{title:string,key:string,path:string,closable:boolean}[]=[];

const defaultTabs:{title:string,key:string,path:string,closable:boolean}[]=[{
  title:'分析页面',
  key:'/dashboard/analysis',
  path:'/dashboard/analysis',
  closable:false,
}]
const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};
/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    if(item.children){
      const current = menus.filter(menu=>menu.path===item.path);
      if(current.length===0){
        menus.push(item)
      }
    }
    const tabMenu = tabMenus.filter(tabMenu=>tabMenu.path===item.path);
    if(tabMenu.length===0&&item.name){
      if(!item.children){
        tabMenus.push({
          closable:item.closable || true,
          title:item.name,
          key:item.path||'',
          path:item.path||'',
        })
      }
    }

    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 蚂蚁金服体验技术部出品`}
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;

  const [tabs,setTabs] = useState<{title:string,key:string,path:string,closable:boolean}[]>(defaultTabs);
  const [activeTabKey,setActiveTabKey] = useState<string>('');

  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const { formatMessage } = useIntl();

  const removeTabs=(activeKey,action)=>{
    if(action==="remove"){
      const newTabs = [...tabs];
      let index = 0;
      for (let i=0;i<tabs.length;i+=1){
        if(tabs[i].key===activeKey){
          index = i;
          break;
        }
      }
      let openIndex = 0;
      if(index===0){
        // 说明我们删除的是的一个标签。打开标签应该是下一个
        openIndex = index+1;
      }else{
        openIndex = index-1;
      }
      if(openIndex>=tabs.length){
        message.destroy();
        message.warn("至少保留一个标签");
      }else {
        history.push(tabs[openIndex].key);
        setActiveTabKey(tabs[openIndex].key);
        setTabs(newTabs.filter(item => item.key !== activeTabKey));
      }
    }
  }

  const closeTabs = ({key}:{key:string})=>{
    if(key==="other"){
      // 关闭其他标签
      setTabs(tabs.filter(item=>item.key===activeTabKey));
    }else if(key==="all"){
      // 关闭所有标签
      history.push(defaultTabs[0].path);
      setActiveTabKey(defaultTabs[0].key);
      setTabs(defaultTabs);
    }
  }
  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        {...props}
        {...settings}
        onPageChange={(location)=>{
          // TODO 多tab栏的切换
          const currentTab = tabs.filter(tab=>tab.path===location?.pathname);
          if(currentTab.length===0){
            const newTabs = [...tabs];
            const currentTabMenu = tabMenus.filter(tabMenu=>tabMenu.path===location?.pathname);
            if(currentTabMenu.length>0){
              newTabs.push({
                ...currentTabMenu[0],
              });
              setTabs(newTabs);
            }
          }
          setActiveTabKey(location?.pathname||'');
        }}
        onOpenChange={(openKeys)=>{
          if(openKeys.length===1){
            const currentFirstMenu = menus.filter(item=>item.path===openKeys[0]);
            if(currentFirstMenu&&currentFirstMenu.length>0&&currentFirstMenu[0].children){
              const secondMenu = currentFirstMenu[0].children[0];
              if(secondMenu.children){
                history.push(secondMenu.children[0].path);
              }else{
                history.push(secondMenu.path);
              }
            }
          }
        }}
        handleOpenChange={(openKeys)=>{
          const {host,href} = window.location;
          const currentUrl = href.substr(href.indexOf("localhost:8000")+host.length);
          const currentFirstMenu = menus.filter(item=>item.path===openKeys[0]);
          const currentFirstMenu1 = menus.filter(item=>item.path===currentUrl);
          if(currentFirstMenu1.length===0){
            history.push(currentUrl);
            return ;
          }
          if(currentFirstMenu&&currentFirstMenu.length>0&&currentFirstMenu[0].children){
            const secondMenu = currentFirstMenu[0].children[0];
            if(secondMenu.children){
              history.push(secondMenu.children[0].path);
            }else{
              history.push(secondMenu.path);
            }
          }
        }}
      >
        <Authorized authority={authorized!.authority} noMatch={noMatch}>
          <Tabs
            className={styles.menuTabs}
            type="editable-card"
            activeKey={activeTabKey}
            hideAdd
            onTabClick={(activeKey)=>{
              setActiveTabKey(activeKey);
              history.push(activeKey);
            }}
            onEdit={(e,action)=>{
              removeTabs(e,action);
            }}
            tabBarExtraContent={
              <Dropdown overlay={
                <Menu onClick={(e)=>closeTabs(e)}>
                  <Menu.Item key='other'>
                    关闭其他
                  </Menu.Item>
                  <Menu.Item key='all'>
                    关闭全部
                  </Menu.Item>
                </Menu>
              } placement="bottomCenter">
                <Button style={{marginRight:24}} type='primary'>标签管理</Button>
              </Dropdown>
            }
          >
            {
              tabs.map(tab=><Tabs.TabPane key={tab.key} tab={tab.title} closable={!!tab.closable} />)
            }
          </Tabs>
          <div className={styles.content}>
            {children}
          </div>
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={(config) =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

export default connect(({ global, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
