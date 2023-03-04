import "./App.css";
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import axios from "axios";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import QuestionView from "./views/QuestionView";
import Demo from "./views/Demo";
import AudioRecorder from "./views/AudioRecorder";

function App() {
  const [counter, setCounter] = useState(0);

  const [questions, setQuestions] = useState([]);

  const loadQuestions = () => {
    axios
      .get("https://opentdb.com/api.php?amount=10")
      .then((res) => {
        setQuestions(res.data.results);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Demo />,
      // errorElement: <ErrorPage />,
    },
    {
      path: "/question",
      element: <QuestionView />,
      // errorElement: <ErrorPage />,
    },
    {
      path: "/recorder",
      element: <AudioRecorder />,
      // errorElement: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
