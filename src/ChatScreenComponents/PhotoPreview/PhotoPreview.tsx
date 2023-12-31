import React, { useEffect, useState } from 'react';
import './styles.css';
import { Box, Modal } from '@mui/material';
import MessageInput from '../../Assets/MessageInput/MessageInput';
import { useSelectedMenu } from '../../Context/SelectedMenu';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '../../Context/AuthContext';
import {
  Timestamp,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../Firebase/firebaseConfig';
import { useUserChat } from '../../Context/UserChatContext';

const PhotoPreview = () => {
  const { currentUser } = useAuthContext();
  const { sender } = useUserChat();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(true);
  const { imgFile, setImgFile } = useSelectedMenu();

  const handleClose = () => {
    setOpen(false);
    setImgFile(null);
  };

  useEffect(() => {
    imgFile ? setOpen(true) : setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!imgFile === undefined]);
  const handleSent = async () => {
    const combinedId =
      currentUser?.uid > sender?.uid
        ? currentUser?.uid + sender?.uid
        : sender?.uid + currentUser?.uid;

    try {
      // Here we check weather user collection exist in database
      const res = await getDoc(doc(db, 'chats', combinedId));
      if (!res.exists()) {
        // If not then we will create here a database with the r
        setDoc(doc(db, 'chats', combinedId), { messages: [] });

        // here we update chat between two user
        updateDoc(doc(db, 'chats', combinedId), {
          lastMessage: text,
          date: Timestamp.now(),
          senderUid: sender?.uid,
          reciverUid: currentUser?.uid,
          messages: arrayUnion({
            id: uuidv4(),
            img: imgFile,
            text: text,
            senderId: currentUser?.uid,
            date: Timestamp.now(),
          }),
          SenderInfo: {
            pin: false,
            senderId: sender?.uid,
            displayName: sender?.displayName,
            photoURL: sender?.photoURL,
          },
          ReceiverInfo: {
            pin: false,
            receiver: currentUser?.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL,
          },
        });

        setText('');
      } else {
        // here we update chat between two user
        updateDoc(doc(db, 'chats', combinedId), {
          messages: arrayUnion({
            id: uuidv4(),
            image: imgFile,
            text: text,
            senderId: currentUser?.uid,
            date: Timestamp.now(),
          }),
        });

        // Here we update last Messages for the user
        updateDoc(doc(db, 'chats', combinedId), {
          lastMessage: text,
          date: Timestamp.now(),
        });
      }

      setText('');
      setImgFile(null);
    } catch (error) {
      console.log(error);
    }
  };
  const esckey = (evt) => {
    if (evt.keyCode === 27) {
      alert('Escape');
    }
    if (evt.key === 'Enter') {
      if (text.trim() !== '') {
        handleSent();
      }
    }
  };

  return (
    <div
      className='App'
      onKeyDown={(event) => {
        esckey(event);
      }}
    >
      <Modal
        closeAfterTransition
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box in={open} timeout={500}>
          <img
            src={imgFile}
            alt='asd'
            style={{ maxHeight: '400px', maxWidth: '400px' }}
          />
          <MessageInput
            placeHolder='Type your message here..!!!'
            val={text}
            sendBtn={true}
            onclick={handleSent}
            onChange={(e) => setText(e.target.value)}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default PhotoPreview;
