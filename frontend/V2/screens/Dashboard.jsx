import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
import { useNavigation } from '@react-navigation/native'; // For navigation
import { getMe } from '../redux/authSlice'; // Redux action to get user authentication info

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, isError } = useSelector((state) => state.auth); // Get user and error state from Redux

  useEffect(() => {
    dispatch(getMe()); // Fetch authenticated user information

    if (isError) {
      Alert.alert('Authentication Error', 'Please log in to access the dashboard.');
      navigation.navigate('Login'); // Navigate to login screen if not authenticated
    }
  }, [isError, dispatch, navigation]);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <Text style={styles.subtitle}>Role: {user.role}</Text>
          <Button
            title="Go to Add User"
            onPress={() => navigation.navigate('AddUser')} // Navigate to AddUser screen
            color="#4CAF50"
          />
        </>
      ) : (
        <Text style={styles.title}>Loading...</Text>
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});
