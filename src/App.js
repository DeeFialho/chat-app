import React, {useRef, useState} from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBqNiK_ZwGrnb-O2G_W91rKIRliuB7x_cQ",
  authDomain: "chat-app-c243b.firebaseapp.com",
  projectId: "chat-app-c243b",
  storageBucket: "chat-app-c243b.appspot.com",
  messagingSenderId: "852130311937",
  appId: "1:852130311937:web:1423a5da690aacf99f7500"

})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App">
          <h1>Chat</h1>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button classname="signIn"  onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (

    <button className="signOut" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (event) => {
    /*To prevent from refreshing when the form is submitted*/
    event.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    /*To write a new document in the db */
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    
    setFormValue('');

    dummy.current.scrollIntoView({ behavior : 'smooth'});
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg}/> )}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(event) => setFormValue(event.target.value)} />

        <button type="submit">Submit</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messgeClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={'message ${messageClass}'}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}

export default App;
