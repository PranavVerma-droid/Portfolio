/* 
    Copyright (C) 2024  Pranav Verma

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    See a more apt description in LICENSE File Attached to the root of this
    project.
*/

var config = {
    apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
    authDomain: "contactusform-f0ec2.firebaseapp.com",
    databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
    projectId: "contactusform-f0ec2",
    storageBucket: "contactusform-f0ec2.appspot.com",
    messagingSenderId: "641931730164",
    appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
    measurementId: "G-1RVB7HZQWB"
  };
  
  firebase.initializeApp(config);
  var messagesRef = firebase.database().ref('forms');
  
  // Add Linstener for Form
  $(document).ready(function() {
      const bclick = document.getElementById('contactForm');
      bclick.addEventListener('submit', submitForm);
  });
  
  //var help lol
  
  //const bclick = document.getElementById('contactForm').addEventListener('submit', submitForm);
  
  // Form Submission
  function submitForm(e){
    e.preventDefault();
  
    var name = getInputVal('name');
    var company = ""
    var email = getInputVal('email');
    var phone = ""
    var message = getInputVal('message');
  
    saveMessage(name, company, email, phone, message);
  
  
    document.getElementById('contactForm').reset();
    alert("Thank you for your message! I will get back to you as soon as possible");
  }
  
  function getInputVal(id){
    return document.getElementById(id).value;
  }

  function saveMessage(name, company, email, phone, message){
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
      name: name,
      company: company,
      email: email,
      phone: phone,
      message: message
    });
  }
  