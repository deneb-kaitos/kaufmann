import WebSocket from 'ws';
import wrtc from 'wrtc';

/*
  MediaStream: [Function: MediaStream],
  MediaStreamTrack: [Function: MediaStreamTrack],
  RTCDataChannel: [Function: RTCDataChannel],
  RTCDataChannelEvent: [Function: RTCDataChannelEvent],
  RTCDtlsTransport: [Function: RTCDtlsTransport],
  RTCIceCandidate: [Function: RTCIceCandidate],
  RTCIceTransport: [Function: RTCIceTransport],
  RTCPeerConnection: [Function: RTCPeerConnection],
  RTCPeerConnectionIceEvent: [Function: RTCPeerConnectionIceEvent],
  RTCRtpReceiver: [Function: RTCRtpReceiver],
  RTCRtpSender: [Function: RTCRtpSender],
  RTCRtpTransceiver: [Function: RTCRtpTransceiver],
  RTCSctpTransport: [Function: RTCSctpTransport],
  RTCSessionDescription: [Function: RTCSessionDescription],
  getUserMedia: [Function(anonymous)],
  mediaDevices: MediaDevices {},
*/

const {
  RTCPeerConnection,
} = wrtc;

globalThis.WebSocket = WebSocket;
globalThis.RTCPeerConnection = RTCPeerConnection;
