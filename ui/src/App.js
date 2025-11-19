import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AddTaskForm } from "./components/AddTaskForm";
import { Task } from "./components/Task";
import axios from "axios";
import { API_URL } from "./utils";

import awsExports from "./aws-exports";
import {Amplify} from "aws-amplify";
import {Authenticator, withAuthenticator} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async (user) => {
    try {
      const { data } = await axios.get(API_URL);

      setTasks(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
  <Authenticator>
    {({ signOut, user }) => (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{ padding: "1rem" }}>
          {/* <h3>Welcome, {user?.username}</h3> */}
          <button onClick={signOut}>Sign out</button>

          <AddTaskForm fetchTasks={fetchTasks(user)} />
          {tasks.map((task) => (
            <Task task={task} key={task.id} fetchTasks={fetchTasks} />
          ))}
        </div>
      </ThemeProvider>
    )}
  </Authenticator>
);
}
