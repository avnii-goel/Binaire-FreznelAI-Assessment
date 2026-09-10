import React, { useState } from 'react';
import { Flex, Form, TextField, Button, Heading, Text, View } from '@adobe/react-spectrum';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const action = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
    action(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" height="100vh" gap="size-200">
      <View UNSAFE_className="glass-container" padding="size-400" borderRadius="medium" width="size-4600">
        <Heading level={2} align="center" marginBottom="size-300" UNSAFE_style={{ color: '#1f2937' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </Heading>
        
        <Form onSubmit={handleSubmit} necessityIndicator="icon">
          <TextField 
            label="Email" 
            type="email" 
            isRequired 
            value={email} 
            onChange={setEmail} 
            width="100%"
          />
          <TextField 
            label="Password" 
            type="password" 
            isRequired 
            value={password} 
            onChange={setPassword} 
            width="100%"
          />
          
          {error && <Text UNSAFE_style={{ color: 'var(--spectrum-global-color-red-500)' }}>{error}</Text>}
          
          <Button variant="cta" type="submit" marginTop="size-200" width="100%">
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </Form>

        <Flex justifyContent="center" marginTop="size-200">
          <Button variant="primary" isQuiet onPress={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </Button>
        </Flex>
      </View>
    </Flex>
  );
};

export default Auth;
