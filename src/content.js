import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  query,
  where,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  signOut,
  onAuthStateChanged,
  authStateReady,
} from 'firebase/auth';

// // Log to verify the script is running
console.log("LinkedIn Helper Extension is active!");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAUhUREugDSck6Z3Mc23pkSeoxJm5zC3uA',
  authDomain: 'homework-2-64719.firebaseapp.com',
  projectId: 'homework-2-64719',
  storageBucket: 'homework-2-64719.firebasestorage.app',
  messagingSenderId: '579460433097',
  appId: '1:579460433097:web:b5961a58840b18b9647918',
};
const app = initializeApp(firebaseConfig);

class user {
  db = getFirestore(app);
  usersRef = collection(this.db, 'users');
  currentUser = undefined;

  async newUser(user) {
    try {
      await addDoc(this.usersRef, {
        user_id: user.uid,
        name: user.displayName,
        tags: [],
      });
      console.log('User added', user.uid);
      return true;
    } catch (error) {
      console.log('Error adding new user', error);
      return false;
    }
  }

  async doesUserExist(user) {
    try {
      const userQuery = query(this.usersRef, where('user_id', '==', user.uid));

      const querySnapshot = await getDocs(userQuery);
      console.log('User found:', !querySnapshot.empty);
      return !querySnapshot.empty;
    } catch (error) {
      console.log('Failed check user exist function', error);
      return false;
    }
  }

  async getUserTags(userId) {
    try {
      const userQuery = query(this.usersRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(userQuery);

      const tagsArray = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          tagsArray.push(...data.tags);
        }
      });
      return tagsArray;
    } catch (error) {
      console.log('Error getting tags', error);
    }
  }

  async addTagToUser(userId, newTag) {
    try {
      // Query documents where userId matches
      const userQuery = query(this.usersRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          tags: arrayUnion(newTag),
        });
        console.log(`Added ${newTag} to the user ${userId}`);
        return true;
      } else {
        console.log(`No document found with user_id: ${userId}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating array:', error);
      return false;
    }
  }

  async removeTagFromUser(userId, removedTag) {
    try {
      // Query documents where userId matches
      const userQuery = query(this.usersRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          tags: arrayRemove(removedTag),
        });
        console.log(`Removed ${removedTag} to the user ${userId}`);
        return true;
      } else {
        console.log(`No document found with user_id: ${userId}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating array:', error);
      return false;
    }
  }

  async getGapiField() {
    try {
      // Reference the "environment" collection
      const environmentCollection = collection(this.db, "environment");
  
      // Get all documents (assuming there is only one document)
      const querySnapshot = await getDocs(environmentCollection);
  
      if (querySnapshot.empty) {
        console.log("No documents found in 'environment' collection.");
        return null;
      }
  
      // Assuming only one document exists, get the first document
      const doc = querySnapshot.docs[0];
      const gapi = doc.data().gapi;
  
      console.log("GAPI field value:", gapi);
      return gapi;
    } catch (error) {
      console.error("Error fetching the GAPI field:", error);
    }
  }
}

class helper {
  db = getFirestore(app);
  applicationRef = collection(this.db, 'applications');
  auth = getAuth(this.app);
  user = new user();
  currUser = undefined;
  async ensureInitialized() {
    await this.auth.authStateReady();
    this.currUser = this.auth.currentUser;
  }

  async ensureLoggedIn() {
    await this.ensureInitialized();
    if (!this.currUser) {
      return false;
    } else {
      console.log('LOGGED IN USER:', this.currUser);
      return true;
    }
  }

  async init() {
    super.init(...arguments);
    await this.ensureInitialized();
    onAuthStateChanged(this.auth, (currUser) => (this.currUser = currUser));
  }

  async sign_in_with_popup() {
    console.log("HELPER IN SIGN IN");
    if (!this.user) {
      throw new Error('No user service');
    }
    console.log("HELPER IN SIGN IN");

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    console.log("HELPER BEFORE SIGN IN");
    const result = await signInWithPopup(this.auth, provider);
    console.log("HELPER AFTER SIGN IN");
    await this.ensureLoggedIn();
    let userExist = await this.user.doesUserExist(this.currUser);
    if (!userExist) {
      console.log('Need to add user');
      await this.user.newUser(this.currUser);
    }
    return result;
  }

  async sign_out() {
    signOut(this.auth);
    this.currUser = undefined;
    this.redirect('');
  }
}

let fb = new helper();
console.log("HELPER FB", fb, app)
await fb.sign_in_with_popup();

console.log(fb.applicationRef);
// Select a specific element on LinkedIn (as an example)
const targetElement = document.querySelector(
  ".relative.job-details-jobs-unified-top-card__container--two-pane"
);

if (targetElement) {
  console.log("Helper Target element found:", targetElement);

  // Example: Add a button dynamically under the `.mt4` class
  const mt4Element = targetElement.querySelector(".mt4");
  if (mt4Element) {
    const button = document.createElement("button");
    button.textContent = "Click Me";
    button.style.backgroundColor = "#0073b1"; // LinkedIn blue
    button.style.color = "white";
    button.style.padding = "10px 20px";
    button.style.borderRadius = "5px";
    mt4Element.appendChild(button);
  }
}
else {
  console.log("Helper COULD NOT FIND ELEMNENT")
}