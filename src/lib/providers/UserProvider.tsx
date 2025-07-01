import React, { createContext, useContext, useState } from "react";

import { IUserDTO } from "@/lib/models";

const UserContext = createContext<
  | {
      user: IUserDTO | undefined;
      setUser: React.Dispatch<React.SetStateAction<IUserDTO | undefined>>;
    }
  | undefined
>(undefined);

export const UserProvider: React.FC<{
  value: IUserDTO | undefined;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const [user, setUser] = useState<IUserDTO | undefined>(value);

  const contextValue = {
    user,
    setUser,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
