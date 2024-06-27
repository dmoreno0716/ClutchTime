import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import { getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyBs1rw4tfcC3Q4ECE1mcf-Xzmb0fkm1-bw",
    authDomain: "clutchtime-3b462.firebaseapp.com",
    projectId: "clutchtime-3b462",
    storageBucket: "clutchtime-3b462.appspot.com",
    messagingSenderId: "415004825907",
    appId: "1:415004825907:web:386aec03a67cf1e8374646",
    measurementId: "G-D056RGDC3G"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId')
    if(loggedInUserId){
        const docRef=doc(db, "users", loggedInUserId)
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserFName').innerText=userData.firstName;
                document.getElementById('loggedUserEmail').innerText=userData.email
                document.getElementById('loggedUserLName').innerText=userData.lastName
            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("err or getting document");
        })
    }
    else{
        console.log("user id not found in local storage")
    }
  })

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click', ()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='index.html';
    })
    .catch((error)=>{
        console.error('error signing out', error);
    })
  })