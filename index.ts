import { registerRootComponent } from 'expo';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, MediaStream, MediaStreamTrack, mediaDevices, registerGlobals } from 'react-native-webrtc';

// Polyfill WebRTC globals for standard browser WebRTC code
registerGlobals();


import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
