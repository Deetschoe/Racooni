import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_MJVFI4Nf_5uyJ3iFC6kNpQDW93FZZYU",
  authDomain: "racooni-4448c.firebaseapp.com",
  projectId: "racooni-4448c",
  storageBucket: "racooni-4448c.appspot.com",
  messagingSenderId: "402784153819",
  appId: "1:402784153819:web:71815ab9fae8a53a3c1cfe",
  measurementId: "G-0H412LL09S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function Racomap() {
  const [location, setLocation] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [camera, setCamera] = useState(null);
  const [treasures, setTreasures] = useState([]);

  useEffect(() => {
    const fetchTreasures = async () => {
      try {
        const treasuresSnapshot = await db.collection("users").doc("treasures").get();
        if (treasuresSnapshot.exists) {
          const treasuresData = treasuresSnapshot.data();
          setTreasures([treasuresData]);
        }
      } catch (error) {
        console.log("Error fetching treasures:", error);
      }
    };

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.LocationAccuracy.BestForNavigation
        },
        ({coords}) => {
          setLocation(coords);
        }
      );
      return () => subscription.remove();
    };

    const checkCameraPermissions = async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus === 'granted');

      if (cameraStatus !== 'granted') {
        alert('We need to use your camera to capture some sidewalk treasure');
      }
    };

    fetchTreasures();
    startLocationTracking();
    checkCameraPermissions();
  }, []);

  const openCamera = () => {
    setCameraVisible(!isCameraVisible);
  };

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      console.log(data.uri);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    button: {
      position: 'absolute',
      bottom: 0,
      right: 135,
      margin: 40
    },
    captureButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      marginBottom: 0
    },
  });

  return (
    <View style={styles.container}>
      {isCameraVisible ? (
        <>
          <Camera style={styles.camera} ref={ref => setCamera(ref)} />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'black' }}> Take Photo </Text>
          </TouchableOpacity>
        </>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 44.4759,
            longitude: -73.2121,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {treasures.map(({ emoji, imageUrl, location, timestamp }, index) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: location[0],
                  longitude: location[1],
                }}
                title={emoji}
                image={{
                  uri: imageUrl,
                  width: 10,
                  height: 1,
                }}
              />
            );
          })}
          {location ? (
            <Marker
              coordinate={{
                latitude: 44.423378762631884,
                longitude: -73.21429052034486,
              }}
              title={"Randy the Raccoon"}
              image={{
                uri: "🥫",
                width: 10,
                height: 1,
              }}
            />
          ) : null}
        </MapView>
      )}
      {cameraPermission &&
        <View style={styles.button}>
          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Ionicons name="camera" size={42} color="black" />
          </TouchableOpacity>
        </View>
      }
    </View>
  );
}

export default Racomap;
