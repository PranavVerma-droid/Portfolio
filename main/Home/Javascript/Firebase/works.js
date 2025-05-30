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

const pbWorks = new PocketBase('https://pb-1.pranavv.co.in');

const appWorks = Vue.createApp({
  data() {
    return {
      competitionName: "",
      competitionDescription: "",
      competitionParticipationDate: "",
      competitionAdditionalUrl1: "",
      competitionAdditionalUrl2: "",
      competitionAdditionalUrl3: "",
      competitionAdditionalUrl4: "",
      competitions: [],

      projectName: "",
      projectDescription: "",
      projectImage: "",
      projectStartDate: "",
      projectEndDate: "",
      projectAdditionalUrl1: "",
      projectAdditionalUrl2: "",
      projectAdditionalUrl3: "",
      projectAdditionalUrl4: "",
      projects: [],

      publicationName: "",
      publicationDescription: "",
      publicationImg: "",
      publicationJournal: "",
      publicationDate: "",
      publicationLink1: "",
      publicationLink2: "",
      publicationLink3: "",
      publicationLink4: "",
      publications: [],

      workshopName: "",
      workshopIssuerName: "",
      workshopParticipationDate: "",
      workshopAdditionalUrl1: "",
      workshopAdditionalUrl2: "",
      workshopAdditionalUrl3: "",
      workshopAdditionalUrl4: "",
      online: null,
      workshops: [],

      internshipName: "",
      internshipDescription: "",
      internshipStartDate: "",
      internshipEndDate: "",
      internshipInstituteName: "",
      internshipType: "",
      internshipImg: "",
      internshipAdditionalUrl1: "",
      internshipAdditionalUrl2: "",
      internshipAdditionalUrl3: "",
      internships: [],

      certificateName: "",
      certificateIssue: "",
      certificateImg: "",
      certificateUrl: "",
      certificateIssueDate: "",
      certificates: [],

      socialWorkName: "",
      socialWorkDescription: "",
      socialWorkStartDate: "",
      socialWorkEndDate: "",
      socialWorkInstituteName: "",
      socialWorkAdditionalUrl1: "",
      socialWorkAdditionalUrl2: "",
      socialWorkAdditionalUrl3: "",
      socialWorkImg: "",
      socialWorks: [],

      loading: false,
      error: null
    };
  },

  mounted() {
    this.loadAll();
  },

  methods: {
    async loadAll() {
      try {
        await Promise.all([
          this.loadProjects(),
          this.loadCompetitions(),
          this.loadInternships(),
          this.loadCertificates(),
          this.loadWorkshops(),
          this.loadSocialWorks(),
          this.loadPublications()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    },

    async loadProjects() {
      try {
        const records = await pbWorks.collection('projects').getFullList({
          sort: '-projectStartDate' 
        });
        this.projects = records;
        
        // Process project images display
        console.log("Loaded projects:", this.projects);
        
        this.projects.forEach(project => {
          console.log("Processing project:", project.projectName);
          
          // Check if the project has an image field with multiple formats
          if (project.projectImage) {
            if (typeof project.projectImage === 'object' && project.projectImage.length > 0) {
              // Handle PocketBase file object format
              project.projectImage = `https://pb-1.pranavv.co.in/api/files/${project.collectionId}/${project.id}/${project.projectImage[0]}`;
            } else if (typeof project.projectImage === 'string' && project.projectImage.trim() !== '') {
              // Handle string format (direct URL or filename)
              if (!project.projectImage.startsWith('http')) {
                project.projectImage = `https://pb-1.pranavv.co.in/api/files/${project.collectionId}/${project.id}/${project.projectImage}`;
              }
            } else {
              // No valid image, try to use link preview
              this.setLinkPreviewOrPlaceholder(project);
            }
          } else {
            // No image field, try to use link preview
            this.setLinkPreviewOrPlaceholder(project);
          }
          
          console.log("Final image URL:", project.projectImage);
        });
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    },
    
    // Helper method to set link preview or placeholder
    setLinkPreviewOrPlaceholder(project) {
      if (project.projectAdditionalUrl1) {
        // Try to get a link preview
        if (project.projectAdditionalUrl1.includes('github.com')) {
          // GitHub repository preview
          const repoPath = project.projectAdditionalUrl1.replace('https://github.com/', '');
          project.projectImage = `https://opengraph.githubassets.com/1/${repoPath}`;
        } else {
          // For other URLs, use a service like microlink.io for link previews
          // Fallback to placeholder with project name and link icon
          project.projectImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(project.projectName)}`;
          project.isLinkPreview = true;
        }
      } else {
        // No URL available, use text placeholder
        project.projectImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(project.projectName)}`;
      }
    },

    async loadCertificates() {
      try {
        const records = await pbWorks.collection('certificates').getFullList();
        this.certificates = records;
      } catch (error) {
        console.error('Failed to load certificates:', error);
      }
    },

    async loadCompetitions() {
      try {
        const records = await pbWorks.collection('competitions').getFullList({
          sort: '+class'
        });
        this.competitions = records;
      } catch (error) {
        console.error('Failed to load competitions:', error);
      }
    },

    async loadInternships() {
      try {
        const records = await pbWorks.collection('internships').getFullList({
          sort: '+class'
        });
        this.internships = records;
      } catch (error) {
        console.error('Failed to load internships:', error);
      }
    },

    async loadWorkshops() {
      try {
        const records = await pbWorks.collection('workshops').getFullList();
        this.workshops = records;
        records.forEach(workshop => {
          workshop.isOnline = workshop.online === true;
          
          // Process workshop images for display
          if (workshop.workshopAdditionalUrl1) {
            // Check if the URL is a GitHub certificate/PDF link
            if (workshop.workshopAdditionalUrl1.includes('github.com') && 
                (workshop.workshopAdditionalUrl1.includes('.pdf') || 
                 workshop.workshopAdditionalUrl1.includes('Certificates') || 
                 workshop.workshopAdditionalUrl1.includes('certificate'))) {
              
              // Extract the GitHub username and repo from the URL
              const githubUrlParts = workshop.workshopAdditionalUrl1.split('github.com/')[1].split('/');
              const username = githubUrlParts[0];
              const repo = githubUrlParts[1];
              
              // Set a preview image for the certificate
              workshop.workshopImage = `https://opengraph.githubassets.com/1/${username}/${repo}`;
            } else if (workshop.workshopAdditionalUrl1.includes('github.com')) {
              // Standard GitHub repository preview
              const repoPath = workshop.workshopAdditionalUrl1.replace('https://github.com/', '');
              workshop.workshopImage = `https://opengraph.githubassets.com/1/${repoPath}`;
            } else {
              // For other URLs, use a placeholder with workshop name
              workshop.workshopImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(workshop.workshopName)}`;
            }
          } else {
            // No URL available, use text placeholder
            workshop.workshopImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(workshop.workshopName)}`;
          }
        });
      } catch (error) {
        console.error('Failed to load workshops:', error);
      }
    },

    async loadSocialWorks() {
      try {
        const records = await pbWorks.collection('socialwork').getFullList({
          sort: '+class'
        });
        this.socialWorks = records;
      } catch (error) {
        console.error('Failed to load social works:', error);
      }
    },

    async loadPublications() {
      try {
        const records = await pbWorks.collection('publications').getFullList({
          sort: '-publicationDate'
        });
        this.publications = records;
      } catch (error) {
        console.error('Failed to load publications:', error);
      }
    },

    visitLink(link) {
      window.open(link, '_blank');
    },

    formatDuration(startDate, endDate) {
      if (!startDate) return '';
      
      const start = new Date(startDate);
      const startFormatted = start.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      
      if (!endDate) {
        return `${startFormatted} - Present`;
      }
      
      const end = new Date(endDate);
      const endFormatted = end.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      
      const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                       (end.getMonth() - start.getMonth());
      
      const durationText = monthDiff === 1 ? '1 Month' : `${monthDiff} Months`;
      
      return `${startFormatted} - ${endFormatted} (${durationText})`;
    },

    formatOnlyDate(date) {
      if (!date) return '';
      const certDate = new Date(date);
      return certDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
  }
});

appWorks.mount('#work_vue');