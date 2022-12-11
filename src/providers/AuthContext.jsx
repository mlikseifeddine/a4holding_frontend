import React, {
    useState,
    useContext,
    createContext,
  } from "react";
  
  const authContext = createContext();
  
  // Provider component that wraps your app and makes auth object ...
  // ... available to any child component that calls useAuth().
  export default function ProvideAuth({ children }) {
    let auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
  }
  
  // Hook for child components to get the auth object ...
  // ... and re-render when it changes.
  export const useAuth = () => {
    return useContext(authContext);
  };
  
  // Provider hook that creates auth object and handles state
  function useProvideAuth() {

    // Do not set as pending if we're logged on!
    const [user, setUser] = useState();

    // Now we set the state based on what our cookie sID + public.Session table returns.
    // Either "pending" if not logged yet, or username value if we're logged.
    const checkAuth = async () => {
      const result = await fetch(process.env.REACT_APP_API_ENDPOINT + "/me", {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
  
      if (result.status === 200) {
        const responseUser = await result.json();
        setUser(responseUser);
        return responseUser;
      } else {
        setUser("pending");
        return false;
      }
    };
  
    const signin = async (username, password) => {
      const result = await fetch(process.env.REACT_APP_API_ENDPOINT + "/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        mode: "cors",
        credentials: "include",
      });
  
      if (result.status === 200) {
        const responseUser = await result.json();
        setUser(responseUser);
        window.localStorage.setItem('authlevel', responseUser.auth);
    
        return responseUser;
      } else {
        setUser(null);
        return false;
      }
    };
  
    const signout = async () => {

      //Get current user based on session cookie.
      const user = await checkAuth();

      //Pass the username as an extra value with the cookie to close the session.
      const result = await fetch(process.env.REACT_APP_API_ENDPOINT + "/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username }),
        mode: "cors",
        credentials: "include",
      });
  
      if (result.status === 200) {
        //Session is closed server side: Cookie is already deleted, so get rid of local/session storage variables.
        setUser(null);
        window.localStorage.clear();
        window.sessionStorage.clear();
        return true;
      } else {
        return false;
      }
    };
  
    // Return the user object and auth methods
    return {
      user,
      setUser,
      signin,
      checkAuth,
      signout,
    };
  }