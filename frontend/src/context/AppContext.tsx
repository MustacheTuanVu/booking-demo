/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useState, ReactNode } from "react";

interface AppContextProps {
  userInfo: any;
  saveUserInfo: (userData: any) => void;
  isLogin: boolean;
  saveIsLogin: (flag: boolean) => void;
  notifications: any;
  setNotifications: (data: any) => void;

  eventSelected: any;
  saveEventSelected: (data: any) => void;
}

export const AppContext = createContext<AppContextProps>({
  userInfo: null,
  saveUserInfo: () => { },
  isLogin: false,
  saveIsLogin: () => { },
  notifications: {},
  setNotifications: () => { },
  eventSelected: null,
  saveEventSelected: () => { },
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const saveUserInfo = (userData: any) => {
    setUserInfo(userData);
  };

  const [isLogin, setIsLogin] = useState(false);
  const saveIsLogin = (flag: boolean) => {
    setIsLogin(flag);
  };

  // Thêm state notifications
  const [notifications, setNotifications] = useState<any>({});

  const [eventSelected, setEventSelected] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedEvent = localStorage.getItem("eventSelected");
        if (savedEvent && savedEvent !== "undefined" && savedEvent !== "null") {
          return JSON.parse(savedEvent);
        }
      } catch (error) {
        console.error("Failed to parse eventSelected from localStorage:", error);
        localStorage.removeItem("eventSelected");
      }
    }
    return null;
  });

  const saveEventSelected = (data: any) => {
    setEventSelected(data);
    if (data && data !== undefined && data !== null) {
      localStorage.setItem("eventSelected", JSON.stringify(data));
    } else {
      localStorage.removeItem("eventSelected");
    }
  };

  return (
    <AppContext.Provider
      value={{
        userInfo,
        saveUserInfo,
        isLogin,
        saveIsLogin,
        notifications,
        setNotifications,
        eventSelected,
        saveEventSelected
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
