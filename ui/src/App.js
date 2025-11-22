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

    //Gets the tasks sorted by date createdAt
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(API_URL);

      const sorted = Array.isArray(data)
        ? data.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        : [];

      setTasks(sorted);
    } catch (err) {
      console.log(err);
    }
  };
  
  //fetches tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    /* Renders the tasks*/
  <Authenticator>
    {({ signOut, user }) => (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{ padding: "1rem" }}>
          {/* <h3>Welcome, {user?.username}</h3> */}
          <button onClick={signOut}>Sign out</button>
          <AddTaskForm fetchTasks={fetchTasks} />
          
          {tasks.map((task) => (
            <Task task={task} key={task.id} fetchTasks={fetchTasks} />
          ))}
        </div>
      </ThemeProvider>
    )}
  </Authenticator>
);
}
