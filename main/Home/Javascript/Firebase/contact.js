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

const pbContact = new PocketBase('https://db.pranavv.co.in');

const appContact = Vue.createApp({
    data() {
        return {
            name: '',
            email: '',
            message: '',
            loading: false,
            error: null
        };
    },

    methods: {
        async submitForm(e) {
            e.preventDefault();
            
            if (this.loading) return;
            
            this.loading = true;
            this.error = null;

            try {
                if (!this.name || !this.email || !this.message) {
                    throw new Error('Please fill all required fields');
                }

                const data = {
                    name: this.name,
                    email: this.email,
                    message: this.message,
                    created: new Date().toISOString()
                };

                await pbContact.collection('forms').create(data);
                
                alert("Thank you for your message! I will get back to you as soon as possible");
                
                // Reset form
                this.name = '';
                this.email = '';
                this.message = '';

            } catch (error) {
                console.error('Failed to submit form:', error);
                this.error = error.message;
                alert("Failed to submit form. Please try again.");
            } finally {
                this.loading = false;
            }
        }
    }
});

appContact.mount('#contact_container');