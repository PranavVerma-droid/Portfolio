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
const pbLinks = new PocketBase('https://db.pranavv.co.in');

const appLinks = Vue.createApp({
  data() {
    return {
      socialName: "",
      socialImg: "",
      socialSource: "",
      socialIcon: "",
      socials: [],
      loading: false,
      error: null
    };
  },

  mounted() {
    this.loadSocials();
  },

  methods: {
    async loadSocials() {
      this.loading = true;
      try {
        const records = await pbLinks.collection('socials').getFullList({
          sort: '+socialName',
        });
        this.socials = records;
      } catch (error) {
        console.error('Failed to load socials:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    visitLink(link) {
      window.open(link, '_blank');
    }
  }
});

appLinks.mount('#linksTable');