import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Amplify } from 'aws-amplify';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
import config from './src/aws-exports';
import { createTodo } from './src/graphql/mutations';
import { listTodos } from './src/graphql/queries';

import { withAuthenticator } from 'aws-amplify-react-native';

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
const initialState = { name: '', description: '' };

const ToDoApp = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  // signOut();

  useEffect(() => {
    // fetchTodos();
    setFormState(initialState);
    setTodos([]);
    
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todosList = todoData.data.listTodos.items;
      setTodos(todosList);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }
  async function signOut()  {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <Button title="Create Todo" onPress={addTodo} />
      <View style={styles.todoListWrapper}>
        {todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text>{todo.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'flex-start',
    padding: 20,
  },
  todo: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 8,
  },
  todoListWrapper: { marginTop: 20 },
  todoName: { fontSize: 18 },
});

 export default withAuthenticator(ToDoApp);
