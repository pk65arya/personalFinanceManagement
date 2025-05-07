import {auth,db} from "../JS/firbase-config.js";
import {collection,addDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"


document.getElementById('budget-form').addEventListener("submit", async(e)=>{
  const category=document.getElementById('category').value;
  const amount=document.getElementById('budget-amount').value;
  const month=document.getElementById('budget-month').value;
  console.log('check')
  onAuthStateChanged(auth,async(user)=>{
    if(!user){
     
      alert('User not logged in');
      return;
    }

    try {
      await addDoc(collection,(db,"budgetLimit"),{
        userId:user.uid,
        type:"limit",
        category,
        amount,
        month,
        createdAt:serverTimestamp()
      })
      alert("Expense added successfully!");
        document.getElementById('expense-form').reset();
    } catch (error) {
      console.error("Error adding expense:", err);
      alert('Failed to add Expense.')
    }
  })
})