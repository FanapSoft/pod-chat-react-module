export function serverConfig(isSandbox) {
  return {
    socketAddress: isSandbox ? "wss://chat-sandbox.pod.ir/ws" : "wss://msg.pod.ir/ws",
    platformHost:  isSandbox ? "https://sandbox.pod.ir:8043/srv/basic-platform" : "https://api.pod.ir/srv/core",
    fileServer:  isSandbox ? "https://sandbox.pod.land:8443" : "https://core.pod.ir"
  }
}