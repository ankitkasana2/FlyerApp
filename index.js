/**
 * @format
 */

// Required for amazon-cognito-identity-js SRP auth in React Native
import 'react-native/Libraries/Core/InitializeCore';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
