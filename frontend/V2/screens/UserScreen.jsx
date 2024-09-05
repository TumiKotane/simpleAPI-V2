import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert } from 'react-native';

const API_URL = 'http://localhost:3000:/users'; // Replace with your backend URL

const UserScreen = () => {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [newUserName, setNewUserName] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_URL, { credentials: 'include' });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserById = async () => {
        try {
            const response = await fetch(`${'http://localhost:3000:/users'}/${userId}`, { credentials: 'include' });
            const data = await response.json();
            setUserName(data.name); // Assuming user object has a 'name' property
        } catch (error) {
            console.error('Error fetching user by ID:', error);
        }
    };

    const createUser = async () => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newUserName }),
                credentials: 'include'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const updateUser = async () => {
        try {
            await fetch(`${'http://localhost:3000:/users'}/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName }),
                credentials: 'include'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async () => {
        try {
            await fetch(`${'http://localhost:3000:/users'}/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Users List:</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.name}</Text>
                    </View>
                )}
            />

            <TextInput
                placeholder="Enter User ID"
                value={userId}
                onChangeText={setUserId}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Fetch User" onPress={fetchUserById} />

            <TextInput
                placeholder="Enter New User Name"
                value={newUserName}
                onChangeText={setNewUserName}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Create User" onPress={createUser} />

            <TextInput
                placeholder="Update User Name"
                value={userName}
                onChangeText={setUserName}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Update User" onPress={updateUser} />

            <Button title="Delete User" onPress={deleteUser} />
        </View>
    );
};

export default UserScreen;
