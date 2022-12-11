import './styling/App.less';

import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Switch,
  Route,
} from "react-router-dom";

import ProvideAuth, { useAuth } from "./providers/AuthContext";

import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import NotFound from "./routes/NotFound";
import Assessment from './routes/Assessment';
import AssessmentProcess from './routes/AssessmentProcess';
import Processes from './routes/Processes';
import Processpage from './routes/Processpage';
import EditControl from './routes/EditControl';
import NewControl from './routes/NewControl';
import Risks from './routes/Risks';
import Compilation from './routes/Compilation';
import Controls from './routes/Controls';
import Unauthorized from './routes/Unauthorized';
import Users from './routes/Users';
import Results from './routes/Results';
import ResultsPage from './routes/ResultsPage';
import CompilationHistory from './routes/CompilationHistory';
import CompilationHistoryPage from './routes/CompilationHistoryPage';
import CompilationViewer from './routes/CompilationViewer';

function CheckAuth({ children }) {
  const auth = useAuth();

  useEffect(() => {
    //Check is run only if data hasn't been fetched yet, make it compliant witth deps array
    if (auth.user === undefined) auth.checkAuth();
  }, [auth]);

  if (auth.user === "pending") {
    //User has not performed login yet, redirect him to login page
    if (window.localStorage.getItem('authlevel') !== null){
      window.localStorage.removeItem('authlevel')
    }
    return (
      <Redirect
        to={{
          pathname: "/login",
        }}
      />
    );
  } else if (auth.user) {
    //User is logged in, show all pages
    return children;
  } else {
    //This happens when we haven't fetched enough data yet, before useEffect. Give it time to fetch all data.
    return (
      <div></div>
    );
  }
}

function ComplianceRoute ({component: Component, ...rest}) {

  const auth = useAuth();
  useEffect(() => {
    if (auth.user === undefined) auth.checkAuth();
  }, [auth]);

  return (
    <Route
      {...rest}
      render={(props) => auth.user.auth === 0
        ? <Component {...props} />
        : <Unauthorized/>
      }
    />
  )
}

function LoginPage ({component: Component, ...rest}) {

  return (
    <Route
      {...rest}
      render={(props) => window.localStorage.getItem('authlevel') === null
        ? <Component {...props} />
        : <Redirect
          to={{
          pathname: "/dashboard"
        }}
        />
      }
    />
  )
}

const App = () => {
  
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <LoginPage exact path="/login" component={Login}></LoginPage>
          {/* TODO: This enables root path, but do we want to build something here or go straight to login? Removing allows the latter
          <Route exact path="/"></Route>
          */}
          <Route
            render={() => (
              <CheckAuth>
                <Switch>
                  <Route exact path="/">
                    <Redirect to="/dashboard"/>
                  </Route>
                  <Route exact path="/dashboard">
                    <Dashboard />
                  </Route>
                  <Route exact path="/assessment">
                    <Assessment />
                  </Route>
                  <Route exact path="/assessment/process">
                    <AssessmentProcess />
                  </Route>
                  <Route exact path="/assessment/process/compilation">
                    <Compilation />
                  </Route>
                  <Route exact path="/history">
                    <CompilationHistory />
                  </Route>
                  <Route exact path="/history/process">
                    <CompilationHistoryPage />
                  </Route>
                  <Route exact path="/history/process/control">
                    <CompilationViewer />
                  </Route>
                  {/* Routes below this are aavailable for Compliance Users only. */}
                  <ComplianceRoute exact path='/results' component={Results} ></ComplianceRoute>
                  <ComplianceRoute exact path='/results/overview' component={ResultsPage} ></ComplianceRoute>
                  <ComplianceRoute exact path='/processes' component={Processes} ></ComplianceRoute>
                  <ComplianceRoute exact path='/processes/processpage' component={Processpage} ></ComplianceRoute>
                  <ComplianceRoute exact path='/controls' component={Controls} ></ComplianceRoute>
                  <ComplianceRoute exact path='/controls/editcontrol' component={EditControl} ></ComplianceRoute>
                  <ComplianceRoute exact path='/controls/newcontrol' component={NewControl} ></ComplianceRoute>
                  <ComplianceRoute exact path='/risks' component={Risks} ></ComplianceRoute>
                  <ComplianceRoute exact path='/users' component={Users} ></ComplianceRoute>
                  {/* Routes above this are aavailable for Compliance Users only. */}
                  <Route component={NotFound} />
                </Switch>
              </CheckAuth>
            )}
          />
        </Switch>
      </Router>
    </ProvideAuth>
  );
};

export default App;
