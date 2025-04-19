import { useState, useEffect } from "react";
import { render, Text } from "ink";

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};

// Render the application and wait until it completes or is terminated manually
const { unmount, waitUntilExit } = render(<Counter />);

process.on("SIGINT", unmount);
process.on("SIGTERM", unmount);

await waitUntilExit();
