import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Platform, FlatList, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import HotelDetailScreen from '../hotelDetail';
import axios from 'axios';
import DestinationScreen from '../blog/DestinationScreen';
import SortingScreen from '../blog/SortingPost';
import { useRoute } from '@react-navigation/native';
import ChatScreen from '../ai/ChatOpenaiScreen';
let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const MainPage = () => {

  const route = useRoute();
  const [meetups, setMeetsup] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hotelData ,setHotelData] = useState(null)
  const [isDesitnationVis,setDestinationVis] = useState(false);
  const [isSortVis,setSortVis] = useState(false);
  const [ScreenType,setScreenType] = useState(0);
  const navigation = useNavigation();
 
  const arr = route.params.username;
  const [uid ,setUID] = useState('')

  

  

useEffect(() => {

  setUID(arr); 


  fetch10Post();
}, [arr]); 

useEffect(() => {
  if (uid !== null) {
    console.log('UID has been set:', uid); 
  }
}, [uid]);

useEffect(() => {
  if (meetups) {
    console.log('Updated meetups:', meetups.posts[0].PostID);
  }
}, [meetups]);

const handleButtonPress = (data) => {
  
  setModalVisible(true); 
  console.log(data);
  setHotelData(data);
};
const fetch10Post = async () => {
    try {
      setLoading(true); 
      const res = await axios.get(`${baseUrl}/api/getpost`);
      setMeetsup(res.data); 
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };
const renderMeetups = () => (
    <FlatList
      data={meetups.posts}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.meetupCard}
          onPress={() => handleButtonPress(item)}
        >
         
          <Image source={{ uri: `${baseUrl}${item.imgArr[0]}` }} style={styles.meetupImage} />

          <Text style={styles.locationText}>{item.Address}</Text>
          <Text style={styles.titleText}>{item.HotelName}</Text> 
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.PostID}
      contentContainerStyle={styles.meetupList}
    />
  );
const handleDestPress = () =>{
  setDestinationVis(true)
  setScreenType(2)

}
const handleDestExplore = () =>{
  setDestinationVis(true)
  setScreenType(0)

}
const handleSort = () =>{
  setSortVis(true)
  setScreenType(1)
}
const handleChatBox = () =>{
  setScreenType(4)
}
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
     
      </View>
  
      
  
      <View style={styles.iconsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleDestExplore} >
          <Icon name="earth" size={24} color="#000" />
        </TouchableOpacity>
       
        <TouchableOpacity style={styles.iconButton} onPress={handleDestPress}  >
          <Icon name="triangle-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}  onPress={handleSort}>
          <Icon name="search-sharp" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}  onPress={handleChatBox}>
          <Icon name="happy-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {
  ScreenType === 0 ? (
    meetups && meetups.posts ? renderMeetups() : <Text>Loading...</Text>
  ) : ScreenType === 2 ? (
    <DestinationScreen />
  ) : ScreenType === 1 ? (
    <SortingScreen />
  ) : ScreenType === 4 ? (
    <ChatScreen></ChatScreen>
  ) : null
}
      {/* Render meetups only if they are available */}
    
       
      <Modal
        data={hotelData}
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Icon name="close" size={30} color="#000" />
            </TouchableOpacity>
            <HotelDetailScreen hotelData={hotelData} uid={uid}/>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  searchContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#000',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  iconButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
  },
  meetupList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  meetupCard: {
    backgroundColor: '#F5DEB3',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  meetupImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%', 
    padding: 20,
    position: 'relative',  
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
  },
});

export default MainPage;
