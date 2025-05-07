import {auth,db,storage} from "../JS/firbase-config.js";

import {collection,addDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"

// import {ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js"

import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"

document.getElementById('expense-form').addEventListener("submit",async(e)=>{
  e.preventDefault();

  const amount=parseFloat(document.getElementById('amount').value);
  const category=document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
  const note = document.getElementById('note').value;
 // const file = document.getElementById('receipt').files[0];

  onAuthStateChanged(auth,async (user)=>{
    if(!user){
      alert('User not logged in');
      return;
    }

    // let receiptUrl="";
    // if(file){
    //   const filePath=`receipts/${user.uid}/${Date.now()}_${file.name}`;
    //   const fileRef=ref(storage,filePath);
    //   const snapshot=await uploadBytes(fileRef,file);
    //   receiptUrl=await getDownloadURL(snapshot.ref);
    // }

    try{
      await addDoc(collection(db,"transactions"),{
        userId:user.uid,
        type:"expense",
        amount,
        category,
        date:new Date(date).toISOString(),
        tags,
        note,
        // receiptUrl,
        createdAt:serverTimestamp()
      });
        alert("Expense added successfully!");
        document.getElementById('expense-form').reset();
    }catch(err){
      console.error("Error adding expense:", err);
      alert('Failed to add Expense.')
    }
  })
});