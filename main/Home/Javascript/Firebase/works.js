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
      projectStartDate: "",
      projectEndDate: "",
      projectAdditionalUrl1: "",
      projectAdditionalUrl2: "",
      projectAdditionalUrl3: "",
      projectAdditionalUrl4: "",
      projects: [],

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
          this.loadSocialWorks()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    },

    async loadProjects() {
      try {
        const records = await pbWorks.collection('projects').getFullList({
          sort: '+class'
        });
        this.projects = records;
      } catch (error) {
        console.error('Failed to load projects:', error);
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