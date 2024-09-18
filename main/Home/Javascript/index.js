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

const firebaseConfigIndex = {
    apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
    authDomain: "contactusform-f0ec2.firebaseapp.com",
    databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
    projectId: "contactusform-f0ec2",
    storageBucket: "contactusform-f0ec2.appspot.com",
    messagingSenderId: "641931730164",
    appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
    measurementId: "G-1RVB7HZQWB"
  };
  firebase.initializeApp(firebaseConfigIndex);
  const perf = firebase.performance();


  const suggestionBox = document.getElementById('suggestion-box');
  const stars = document.querySelectorAll('.star');
  const suggestionText = document.getElementById('suggestion-text');
  const submitButton = document.getElementById('submit-suggestion');
  const doNotShowButton = document.getElementById('do-not-show');

  let rating = 0;

  setTimeout(() => {
    if (!localStorage.getItem('suggestionBoxShown')) {
      suggestionBox.style.display = 'block';
    }
  }, 10000);
  stars.forEach(star => {
    star.addEventListener('click', () => {
      rating = parseInt(star.getAttribute('data-rating'));
      stars.forEach((s, index) => {
        s.classList.toggle('active', index < rating);
      });
    });
  });

  submitButton.addEventListener('click', () => {
    const suggestion = suggestionText.value;
    if (rating > 0 || suggestion.trim() !== '') {
      firebase.database().ref('suggestions').push({
        rating: rating,
        suggestion: suggestion,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      
      suggestionBox.style.display = 'none';
      localStorage.setItem('suggestionBoxShown', 'true');
    }
  });

  doNotShowButton.addEventListener('click', () => {
    suggestionBox.style.display = 'none';
    localStorage.setItem('suggestionBoxShown', 'true');
});

function showabout(){
    $("#about_container").css("display","inherit");
    $("#about_container").addClass("animate__animated animate__slideInLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animate__animated animate__slideInLeft");
    },800);
}
function closeabout(){
    $("#about_container").addClass("animate__animated animate__slideOutLeft");
    setTimeout(function(){
        $("#about_container").removeClass("animate__animated animate__slideOutLeft");
        $("#about_container").css("display","none");
    },800);
}
function showwork(){
    $("#work_container").css("display","inherit");
    $("#work_container").addClass("animate__animated animate__slideInRight");
    setTimeout(function(){
        $("#work_container").removeClass("animate__animated animate__slideInRight");
    },800);
}
function closework(){
    $("#work_container").addClass("animate__animated animate__slideOutRight");
    setTimeout(function(){
        $("#work_container").removeClass("animate__animated animate__slideOutRight");
        $("#work_container").css("display","none");
    },800);
}
function showcontact(){
    $("#contact_container").css("display","inherit");
    $("#contact_container").addClass("animate__animated animate__slideInUp");
    setTimeout(function(){
        $("#contact_container").removeClass("animate__animated animate__slideInUp");
    },800);
}
function closecontact(){
    $("#contact_container").addClass("animate__animated animate__slideOutDown");
    setTimeout(function(){
        $("#contact_container").removeClass("animate__animated animate__slideOutDown");
        $("#contact_container").css("display","none");
    },800);
}

function showblogs() {
    $("#blogs_container").css("display", "inherit");
    $("#blogs_container").addClass("animate__slideInDown animate__animated");
    setTimeout(function () {
        $("#blogs_container").removeClass("animate__slideInDown animate__animated");
    }, 800);
}

function closeblogs() {
    $("#blogs_container").addClass("animate__slideOutUp animate__animated");
    setTimeout(function () {
        $("#blogs_container").css("display", "none");
        $("#blogs_container").removeClass("animate__slideOutUp animate__animated");
    }, 800);
}

function showResume() {
    var resumeURL = "https://firebasestorage.googleapis.com/v0/b/contactusform-f0ec2.appspot.com/o/Resume%2FPranav%E2%80%99s%20Resume%201.pdf?alt=media&token=7018b85b-3124-48a8-92a5-ae7fc4c53f15";
    
    window.open(resumeURL, "_blank");
}

if (window.location.hash === '#blogs') {
    setTimeout(function() {
        showblogs();
    }, 1000); 
}

if (window.location.hash === '#about') {
    setTimeout(function() {
        showabout();
    }, 1000); 
}

if (window.location.hash === '#work') {
    setTimeout(function() {
        showwork();
    }, 1000); 
}

if (window.location.hash === '#contact') {
    setTimeout(function() {
        showcontact();
    }, 1000); 
}

setTimeout(function(){
    $("#loading").addClass("animate__animated animate__fadeOut");
    setTimeout(function(){
      $("#loading").removeClass("animate__animated animate__fadeOut");
      $("#loading").css("display","none");
      $("#box").css("display","none");
      $("#about").removeClass("animate__animated animate__fadeIn");
      $("#contact").removeClass("animate__animated animate__fadeIn");
      $("#work").removeClass("animate__animated animate__fadeIn");
      $("#blogs").removeClass("animate__animated animate__fadeIn");
    },1000);
},1500);
