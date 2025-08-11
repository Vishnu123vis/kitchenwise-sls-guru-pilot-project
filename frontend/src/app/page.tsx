"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AppContainer from '../components/AppContainer';

export default function Home() {
  return (
    <Authenticator>
      {() => (
        <>
          <AppContainer />
        </>
      )}
    </Authenticator>
  );
}
