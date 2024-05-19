// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import { useContext } from "react";
import { SocketContext } from "../middleware/SocketContext";

const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export default useSocket;