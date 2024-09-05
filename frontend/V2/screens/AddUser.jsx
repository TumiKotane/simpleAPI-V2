import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'; // Redux
import { useNavigation } from '@react-navigation/native'; // React Navigation for navigation
import { getMe } from '../redux/authSlice'; // Import your Redux slice
import Layout from '../components/Layout'; // Assuming you have a Layout component
import FormAddUser from '../components/FormAddUser'; // Form component to add a user

const AddUser = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation(); // React Navigation for navigating between screens
  const { isError, user } = useSelector((state) => state.auth); // Get the auth state from Redux

  // Fetch user data and check authentication
  useEffect(() => {
    dispatch(getMe()); // Fetch current user authentication status

    if (isError) {
      Alert.alert('Error', 'Authentication failed. Redirecting to login.');
      navigation.navigate('Login'); // Navigate to the login page
    }

    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'Only admins can access this page. Redirecting to dashboard.');
      navigation.navigate('Dashboard'); // Redirect to dashboard if the user is not an admin
    }
  }, [isError, user, navigation, dispatch]);

  return (
    <Layout>
      <FormAddUser />
    </Layout>
  );
};

export default AddUser;
