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

const firebaseConfigLinks = {
    apiKey: "AIzaSyCA_BPpKq3IhLupHnGYbbwq0U1mLdMbJXY",
    authDomain: "contactusform-f0ec2.firebaseapp.com",
    databaseURL: "https://contactusform-f0ec2-default-rtdb.firebaseio.com",
    projectId: "contactusform-f0ec2",
    storageBucket: "contactusform-f0ec2.appspot.com",
    messagingSenderId: "641931730164",
    appId: "1:641931730164:web:0812ee1bf4659f8381d2a1",
    measurementId: "G-1RVB7HZQWB"
  };
  firebase.initializeApp(firebaseConfigLinks);
  const dbLinks = firebase.firestore();
  
  
  
    
        const appLinks = Vue.createApp({
          data() {
            return {
              socialName: "",
              socialImg: "",
              socialSource: "",
              socialIcon: "",
              socials: []
            };
          },
          mounted() {
            this.loadSocials();
          },
          methods: {
                loadSocials() {
                  dbLinks.collection("socials")
                  .orderBy("socialName", "asc")
                  .get()
                    .then(querySnapshot => {
                      const socials = [];
                      querySnapshot.forEach(doc => {
                        const social = doc.data();
                        social.id = doc.id;
                        socials.push(social);
                      });
                      this.socials = socials;
                    })
                    .catch(error => {
                      console.error(error);
                      alert("Failed to load socials.");
                    });         
                  },
              visitLink(link) {
                window.location.href = link;
            }
          }
        });
    
        appLinks.mount('#linksTable');