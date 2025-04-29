import React, { createContext, useContext, useState } from "react";
import { UserDTO } from "../../types";

const UserContext = createContext<
  | {
      user: UserDTO | undefined;
      setUser: React.Dispatch<React.SetStateAction<UserDTO | undefined>>;
    }
  | undefined
>(undefined);

export const UserProvider: React.FC<{
  value: UserDTO | undefined;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const [user, setUser] = useState<UserDTO | undefined>(value);

  const contextValue = {
    user,
    setUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
