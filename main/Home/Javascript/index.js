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
const pbIndex = new PocketBase('https://pb-1.pranavv.co.in');

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

async function showResume() {
    try {
        const userRecord = await pbIndex.collection('users').getOne('4b404bw4707l2s2', {
            fields: 'id,resume,collectionId',
            $cancelKey: 'resume-download-' + Date.now()
        });
        
        if (userRecord?.resume) {
            const fileUrl = pbIndex.files.getUrl(userRecord, userRecord.resume);
            
            if (fileUrl) {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    window.location.href = fileUrl;
                } else {
                    window.open(fileUrl, '_blank');
                }
            } else {
                throw new Error('Invalid file URL');
            }
        } else {
            alert("Resume not found in user profile");
        }
    } catch (error) {
        console.error('Resume fetch error:', error);
        if (error.status === 404) {
            alert("User profile or resume not found");
        } else if (error.isAbort) {
            // Handle abort specifically
            alert("Request was cancelled. Please try again.");
        } else {
            alert("Error loading resume. Please try again later.");
            console.error(error);
        }
    }
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
