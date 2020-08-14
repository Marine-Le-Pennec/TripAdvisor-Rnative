import React, { useEffect, useState, useCallback } from "react";

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  AsyncStorage,
  Image,
} from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";

import axios from "axios";

const Userprofile = ({ token, setToken }) => {
  const [data, setData] = useState({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState(null);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      //   console.log("user id : ", user);
      //   console.log("token : ", token);
      try {
        const id = await AsyncStorage.getItem("id");
        const response = await axios.get(
          "https://express-airbnb-api.herokuapp.com/user/" + id,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        console.log("response: ", response.data);
        setData(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(error.response);
      }
    };

    fetchData();
  }, []);

  const handleProfilChange = async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      // console.log(id);

      const infos = await axios.put(
        "https://express-airbnb-api.herokuapp.com/user/update/" + id,
        {
          email,
          description,
          username,
          name,
        },
        { headers: { Authorization: "Bearer " + token } }
      );

      alert("Infos modifiées");
    } catch (e) {
      console.log(e);
    }
  };

  // Envoie photo
  const handleImagePicked = useCallback(async (pickerResult) => {
    let uploadResponse;
    try {
      const id = await AsyncStorage.getItem("id");
      // console.log("id : ", id);
      setIsUploading(true);
      // Récupérer l'url si il y en a une
      if (!pickerResult.cancelled) {
        const uri = pickerResult.uri;
        // console.log(uri);
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        // Création formData pour envoyer les params dans le back
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        // console.log("formData: ", formData);

        // Requete pour envoyer au serveur
        uploadResponse = await axios.put(
          "https://express-airbnb-api.herokuapp.com/user/upload_picture/" + id,
          formData,
          { headers: { Authorization: "Bearer " + token } }
        );
        console.log(uploadResponse.data.photo[0].url);

        if (
          Array.isArray(uploadResponse.data.photo) === true &&
          uploadResponse.data.photo.length > 0
        ) {
          setImage(uploadResponse.data.photo[0].url);
        }
      }
    } catch (e) {
      alert("Chargement échoué");
    } finally {
      setIsUploading(false);
    }
  });

  return isLoading ? (
    <Text>chargement</Text>
  ) : (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", backgroundColor: "#F35960" }}
    >
      <View>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View
        style={{
          backgroundColor: "white",
          width: "100%",
          height: "100%",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={async () => {
            // gestion autorisation
            const cameraRollPerm = await ImagePicker.requestCameraRollPermissionsAsync();
            // only if user allows permission to camera roll
            if (cameraRollPerm.status === "granted") {
              const pickerResult = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
              });
              // console.log(pickerResult);
              // Appel de la fonction handleImagePicked pour envoyer vers le back
              handleImagePicked(pickerResult);
            }
          }}
        >
          {data.photo.length > 0 ? (
            <View>
              <Image
                //  soit "image" soit url de la requête
                source={{ uri: image ? image : data.photo[0].url }}
                style={{ width: 140, height: 150 }}
              />
            </View>
          ) : (
            <View>
              <Entypo
                name="user"
                size={140}
                color="black"
                style={{ width: "100%" }}
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={{ justifyContent: "center" }}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              setName(text);
            }}
          >
            {data.name}
          </TextInput>
          <TextInput
            onChangeText={(text) => {
              setEmail(text);
            }}
          >
            {data.email}
          </TextInput>
          <TextInput
            onChangeText={(text) => {
              setUsername(text);
            }}
          >
            {data.username}
          </TextInput>
          <TextInput
            onChangeText={(text) => {
              setDescription(text);
            }}
          >
            {data.description}
          </TextInput>
        </View>

        <View>
          <TouchableOpacity onPress={handleProfilChange}>
            <Text>Modifier</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            setToken(null);
          }}
        >
          <Text>Déconnection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Userprofile;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginTop: 51,
    marginBottom: 65,
  },
  input: {
    marginBottom: 30,
    borderBottomColor: "black",
    borderBottomWidth: 1,
    borderColor: "white",
    width: 320,
    borderBottomColor: "white",
    color: "white",
    fontSize: 16,
    lineHeight: 18,
  },
});
