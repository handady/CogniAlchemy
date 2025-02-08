import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setCollapsed } from "@/store/features/workbenchSlice";
import LogoBorder from "@/assets/images/logo_border.png";
import Logo from "@/assets/images/logo.gif";
import styles from "./index.module.scss";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();
  // 设置redux
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector(
    (state: RootState) => state.workbench.collapsed
  );

  // 根据当前路由路径确定激活的菜单项 key
  const getSelectedKey = () => {
    const { pathname } = location;
    if (pathname.startsWith("/cogniAlchemy")) {
      return "2";
    } else if (pathname.startsWith("/learning")) {
      return "3";
    }
    // 默认选中首页或其他
    return "1";
  };

  // 菜单配置
  const menuItems = [
    {
      key: "1",
      icon: (
        <svg
          className="icon"
          aria-hidden="true"
          style={{ width: 16, height: 16 }}
        >
          <use xlinkHref="#icon-women" />
        </svg>
      ),
      label: <Link to="/">测试</Link>,
    },
    {
      key: "2",
      icon: (
        <svg
          className="icon"
          aria-hidden="true"
          style={{ width: 16, height: 16 }}
        >
          <use xlinkHref="#icon-yingshi1" />
        </svg>
      ),
      label: <Link to="/cogniAlchemy">cogniAlchemy</Link>,
    },
    {
      key: "3",
      icon: (
        <svg
          className="icon"
          aria-hidden="true"
          style={{ width: 16, height: 16 }}
        >
          <use xlinkHref="#icon-zhishi" />
        </svg>
      ),
      label: <Link to="/learning">测试</Link>,
    },
  ];

  // 根据窗口宽度自动控制折叠状态
  useEffect(() => {
    const handleResize = () => {
      dispatch(setCollapsed(window.innerWidth < 1360));
    };
    window.addEventListener("resize", handleResize);
    // 初始检测一次
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      className={styles.sidebar}
    >
      {/* Logo 区域 */}
      <div className={styles.logo}>
        <div className={styles.logoContainer}>
          <div
            className={collapsed ? styles.logoBoxCollapsed : styles.logoBox}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <div style={{ position: "relative", width: 60, height: 60 }}>
              <img
                src={LogoBorder}
                alt="Logo Border"
                className={styles.logoBorder}
              />
              <img src={Logo} alt="Logo" className={styles.logoImg} />
            </div>
            <div
              className="font-bold mx-4"
              style={{
                display: collapsed ? "none" : "block",
              }}
            >
              handady
            </div>
          </div>
        </div>
      </div>

      {/* 导航菜单区域 */}
      <Menu
        items={menuItems}
        mode="inline"
        defaultSelectedKeys={[getSelectedKey()]}
        className={styles.customMenu}
        style={{ background: "transparent", border: "none" }}
      />
    </Sider>
  );
};

export default Sidebar;
