import { AppRegistry } from 'react-native';
import App from './App'; // Here, 'App' is your root component file, it could be 'Racomap' or another component, depending on your project structure
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
